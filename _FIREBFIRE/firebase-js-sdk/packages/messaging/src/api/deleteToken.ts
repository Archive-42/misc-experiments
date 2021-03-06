/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

import { MessagingService } from '../messaging-service';
import { deleteTokenInternal } from '../internals/token-manager';
import { registerDefaultSw } from '../helpers/registerDefaultSw';

export async function deleteToken(
  messaging: MessagingService
): Promise<boolean> {
  if (!navigator) {
    throw ERROR_FACTORY.create(ErrorCode.AVAILABLE_IN_WINDOW);
  }

  if (!messaging.swRegistration) {
    await registerDefaultSw(messaging);
  }

  return deleteTokenInternal(messaging);
}
