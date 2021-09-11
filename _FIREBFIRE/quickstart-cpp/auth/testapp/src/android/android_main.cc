// Copyright 2016 Google Inc. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

#include <stdarg.h>
#include <stdio.h>

#include <android/log.h>
#include <android_native_app_glue.h>
#include <pthread.h>
#include <cassert>

#include "main.h"  // NOLINT

// This implementation is derived from http://github.com/google/fplutil

extern "C" int common_main(int argc, const char* argv[]);

static struct android_app* g_app_state = nullptr;
static bool g_destroy_requested = false;
static bool g_started = false;
static bool g_restarted = false;
static pthread_mutex_t g_started_mutex;

// Handle state changes from via native app glue.
static void OnAppCmd(struct android_app* app, int32_t cmd) {
  g_destroy_requested |= cmd == APP_CMD_DESTROY;
}

// Process events pending on the main thread.
// Returns true when the app receives an event requesting exit.
bool ProcessEvents(int msec) {
  struct android_poll_source* source = nullptr;
  int events;
  int looperId = ALooper_pollAll(msec, nullptr, &events,
                                 reinterpret_cast<void**>(&source));
  if (looperId >= 0 && source) {
    source->process(g_app_state, source);
  }
  return g_destroy_requested | g_restarted;
}

// Get the activity.
jobject GetActivity() { return g_app_state->activity->clazz; }

// Get the window context. For Android, it's a jobject pointing to the Activity.
jobject GetWindowContext() { return g_app_state->activity->clazz; }

// Find a class, attempting to load the class if it's not found.
jclass FindClass(JNIEnv* env, jobject activity_object, const char* class_name) {
  jclass class_object = env->FindClass(class_name);
  if (env->ExceptionCheck()) {
    env->ExceptionClear();
    // If the class isn't found it's possible NativeActivity is being used by
    // the application which means the class path is set to only load system
    // classes.  The following falls back to loading the class using the
    // Activity before retrieving a reference to it.
    jclass activity_class = env->FindClass("android/app/Activity");
    jmethodID activity_get_class_loader = env->GetMethodID(
        activity_class, "getClassLoader", "()Ljava/lang/ClassLoader;");

    jobject class_loader_object =
        env->CallObjectMethod(activity_object, activity_get_class_loader);

    jclass class_loader_class = env->FindClass("java/lang/ClassLoader");
    jmethodID class_loader_load_class =
        env->GetMethodID(class_loader_class, "loadClass",
                         "(Ljava/lang/String;)Ljava/lang/Class;");
    jstring class_name_object = env->NewStringUTF(class_name);

    class_object = static_cast<jclass>(env->CallObjectMethod(
        class_loader_object, class_loader_load_class, class_name_object));

    if (env->ExceptionCheck()) {
      env->ExceptionClear();
      class_object = nullptr;
    }
    env->DeleteLocalRef(class_name_object);
    env->DeleteLocalRef(class_loader_object);
  }
  return class_object;
}

// Vars that we need available for appending text to the log window:
class LoggingUtilsData {
 public:
  LoggingUtilsData()
      : logging_utils_class_(nullptr),
        logging_utils_add_log_text_(0),
        logging_utils_init_log_window_(0) {}

  ~LoggingUtilsData() {
    JNIEnv* env = GetJniEnv();
    assert(env);
    if (logging_utils_class_) {
      env->DeleteGlobalRef(logging_utils_class_);
    }
  }

  void Init() {
    JNIEnv* env = GetJniEnv();
    assert(env);

    jclass logging_utils_class = FindClass(
        env, GetActivity(), "com/google/firebase/example/LoggingUtils");
    assert(logging_utils_class != 0);

    // Need to store as global references so it don't get moved during garbage
    // collection.
    logging_utils_class_ =
        static_cast<jclass>(env->NewGlobalRef(logging_utils_class));
    env->DeleteLocalRef(logging_utils_class);

    logging_utils_init_log_window_ = env->GetStaticMethodID(
        logging_utils_class_, "initLogWindow", "(Landroid/app/Activity;)V");
    logging_utils_add_log_text_ = env->GetStaticMethodID(
        logging_utils_class_, "addLogText", "(Ljava/lang/String;)V");

    env->CallStaticVoidMethod(logging_utils_class_,
                              logging_utils_init_log_window_, GetActivity());
  }

  void AppendText(const char* text) {
    if (logging_utils_class_ == 0) return;  // haven't been initted yet
    JNIEnv* env = GetJniEnv();
    assert(env);
    jstring text_string = env->NewStringUTF(text);
    env->CallStaticVoidMethod(logging_utils_class_, logging_utils_add_log_text_,
                              text_string);
    env->DeleteLocalRef(text_string);
  }

 private:
  jclass logging_utils_class_;
  jmethodID logging_utils_add_log_text_;
  jmethodID logging_utils_init_log_window_;
};

LoggingUtilsData* g_logging_utils_data;

// Vars that we need available for reading text from the user.
class TextEntryFieldData {
 public:
  TextEntryFieldData()
      : text_entry_field_class_(nullptr), text_entry_field_read_text_(0) {}

  ~TextEntryFieldData() {
    JNIEnv* env = GetJniEnv();
    assert(env);
    if (text_entry_field_class_) {
      env->DeleteGlobalRef(text_entry_field_class_);
    }
  }

  void Init() {
    JNIEnv* env = GetJniEnv();
    assert(env);

    jclass text_entry_field_class = FindClass(
        env, GetActivity(), "com/google/firebase/example/TextEntryField");
    assert(text_entry_field_class != 0);

    // Need to store as global references so it don't get moved during garbage
    // collection.
    text_entry_field_class_ =
        static_cast<jclass>(env->NewGlobalRef(text_entry_field_class));
    env->DeleteLocalRef(text_entry_field_class);

    static const JNINativeMethod kNativeMethods[] = {
        {"nativeSleep", "(I)Z", reinterpret_cast<void*>(ProcessEvents)}};
    env->RegisterNatives(text_entry_field_class_, kNativeMethods,
                         sizeof(kNativeMethods) / sizeof(kNativeMethods[0]));
    text_entry_field_read_text_ = env->GetStaticMethodID(
        text_entry_field_class_, "readText",
        "(Landroid/app/Activity;Ljava/lang/String;Ljava/lang/String;"
        "Ljava/lang/String;)Ljava/lang/String;");
  }

  // Call TextEntryField.readText(), which shows a text entry dialog and spins
  // until the user enters some text (or cancels). If the user cancels, returns
  // an empty string.
  std::string ReadText(const char* title, const char* message,
                       const char* placeholder) {
    if (text_entry_field_class_ == 0) return "";  // haven't been initted yet
    JNIEnv* env = GetJniEnv();
    assert(env);
    jstring title_string = env->NewStringUTF(title);
    jstring message_string = env->NewStringUTF(message);
    jstring placeholder_string = env->NewStringUTF(placeholder);
    jobject result_string = env->CallStaticObjectMethod(
        text_entry_field_class_, text_entry_field_read_text_, GetActivity(),
        title_string, message_string, placeholder_string);
    env->DeleteLocalRef(title_string);
    env->DeleteLocalRef(message_string);
    env->DeleteLocalRef(placeholder_string);
    if (env->ExceptionCheck()) {
      env->ExceptionDescribe();
      env->ExceptionClear();
    }
    if (result_string == nullptr) {
      // Check if readText() returned null, which will be the case if an
      // exception occurred or if TextEntryField returned null for some reason.
      return "";
    }
    const char* result_buffer =
        env->GetStringUTFChars(static_cast<jstring>(result_string), 0);
    std::string result(result_buffer);
    env->ReleaseStringUTFChars(static_cast<jstring>(result_string),
                               result_buffer);
    return result;
  }

 private:
  jclass text_entry_field_class_;
  jmethodID text_entry_field_read_text_;
};

TextEntryFieldData* g_text_entry_field_data;

// Checks if a JNI exception has happened, and if so, logs it to the console.
void CheckJNIException() {
  JNIEnv* env = GetJniEnv();
  if (env->ExceptionCheck()) {
    // Get the exception text.
    jthrowable exception = env->ExceptionOccurred();
    env->ExceptionClear();

    // Convert the exception to a string.
    jclass object_class = env->FindClass("java/lang/Object");
    jmethodID toString =
        env->GetMethodID(object_class, "toString", "()Ljava/lang/String;");
    jstring s = (jstring)env->CallObjectMethod(exception, toString);
    const char* exception_text = env->GetStringUTFChars(s, nullptr);

    // Log the exception text.
    __android_log_print(ANDROID_LOG_INFO, FIREBASE_TESTAPP_NAME,
                        "-------------------JNI exception:");
    __android_log_print(ANDROID_LOG_INFO, FIREBASE_TESTAPP_NAME, "%s",
                        exception_text);
    __android_log_print(ANDROID_LOG_INFO, FIREBASE_TESTAPP_NAME,
                        "-------------------");

    // Also, assert fail.
    assert(false);

    // In the event we didn't assert fail, clean up.
    env->ReleaseStringUTFChars(s, exception_text);
    env->DeleteLocalRef(s);
    env->DeleteLocalRef(exception);
  }
}

// Log a message that can be viewed in "adb logcat".
void LogMessage(const char* format, ...) {
  static const int kLineBufferSize = 100;
  char buffer[kLineBufferSize + 2];

  va_list list;
  va_start(list, format);
  int string_len = vsnprintf(buffer, kLineBufferSize, format, list);
  string_len = string_len < kLineBufferSize ? string_len : kLineBufferSize;
  // append a linebreak to the buffer:
  buffer[string_len] = '\n';
  buffer[string_len + 1] = '\0';

  __android_log_vprint(ANDROID_LOG_INFO, FIREBASE_TESTAPP_NAME, format, list);
  g_logging_utils_data->AppendText(buffer);
  CheckJNIException();
  va_end(list);
}

// Get the JNI environment.
JNIEnv* GetJniEnv() {
  JavaVM* vm = g_app_state->activity->vm;
  JNIEnv* env;
  jint result = vm->AttachCurrentThread(&env, nullptr);
  return result == JNI_OK ? env : nullptr;
}

// Use a Java class, TextEntryField, to prompt the user to enter some text.
// This function blocks until text was entered or the dialog was canceled.
// If the user cancels, returns an empty string.
std::string ReadTextInput(const char* title, const char* message,
                          const char* placeholder) {
  assert(g_text_entry_field_data);
  return g_text_entry_field_data->ReadText(title, message, placeholder);
}

// Execute common_main(), flush pending events and finish the activity.
extern "C" void android_main(struct android_app* state) {
  // native_app_glue spawns a new thread, calling android_main() when the
  // activity onStart() or onRestart() methods are called.  This code handles
  // the case where we're re-entering this method on a different thread by
  // signalling the existing thread to exit, waiting for it to complete before
  // reinitializing the application.
  if (g_started) {
    g_restarted = true;
    // Wait for the existing thread to exit.
    pthread_mutex_lock(&g_started_mutex);
    pthread_mutex_unlock(&g_started_mutex);
  } else {
    g_started_mutex = PTHREAD_MUTEX_INITIALIZER;
  }
  pthread_mutex_lock(&g_started_mutex);
  g_started = true;

  // Save native app glue state and setup a callback to track the state.
  g_destroy_requested = false;
  g_app_state = state;
  g_app_state->onAppCmd = OnAppCmd;

  // Create the logging display.
  g_logging_utils_data = new LoggingUtilsData();
  g_logging_utils_data->Init();

  // Create the text entry dialog.
  g_text_entry_field_data = new TextEntryFieldData();
  g_text_entry_field_data->Init();

  // Execute cross platform entry point.
  static const char* argv[] = {FIREBASE_TESTAPP_NAME};
  int return_value = common_main(1, argv);
  (void)return_value;  // Ignore the return value.
  ProcessEvents(10);

  // Clean up logging display.
  delete g_logging_utils_data;
  g_logging_utils_data = nullptr;

  // Finish the activity.
  if (!g_restarted) ANativeActivity_finish(state->activity);

  g_app_state->activity->vm->DetachCurrentThread();
  g_started = false;
  g_restarted = false;
  pthread_mutex_unlock(&g_started_mutex);
}
