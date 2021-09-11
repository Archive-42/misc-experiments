/*
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *

/// @brief The received Dynamic Link.
public sealed class ReceivedDynamicLink {
  /// The URL that was passed to the app.
  public System.Uri Url { get; internal set; }
  /// The strength of the match for the link.
  public LinkMatchStrength MatchStrength {get; internal set; }
}

}
