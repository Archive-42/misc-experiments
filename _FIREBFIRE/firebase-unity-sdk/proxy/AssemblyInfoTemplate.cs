/*
 * Copyright 2016 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
ices;

// This file is used by every unity firebase C# Assembly we build.
// Tags like %PROJECT_NAME% are replaced with sed, per project.

[assembly: AssemblyTitle("%PROJECT_NAME%")]
[assembly: AssemblyDescription("")]
[assembly: AssemblyConfiguration("")]
[assembly: AssemblyCompany("Google Inc.")]
[assembly: AssemblyProduct("Firebase")]
[assembly: AssemblyCopyright("Copyright 2016 Google Inc. All Rights Reserved.")]
[assembly: AssemblyTrademark("")]
[assembly: AssemblyCulture("")]

// Any other project to which that we want to make internals visible e.g. test
// assembly.
// %INTERNALS_VISIBLE_TO%

// The assembly version has the format "{Major}.{Minor}.{Build}.{Revision}".
// The form "{Major}.{Minor}.*" will automatically update the build and
// revision, and "{Major}.{Minor}.{Build}.*" will update just the revision.

[assembly: AssemblyVersion("1.0.0.0")]
