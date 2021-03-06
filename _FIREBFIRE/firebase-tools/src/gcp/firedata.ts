import * as api from "../api";
import { logger } from "../logger";
import * as utils from "../utils";

export interface DatabaseInstance {
  // The globally unique name of the Database instance.
  // Required to be URL safe.  ex: 'red-ant'
  instance: string;
}

function _handleErrorResponse(response: any): any {
  if (response.body && response.body.error) {
    return utils.reject(response.body.error, { code: 2 });
  }

  logger.debug("[firedata] error:", response.status, response.body);
  return utils.reject("Unexpected error encountered with FireData.", {
    code: 2,
  });
}

/**
 * List Realtime Database instances
 * @param projectNumber Project from which you want to list databases.
 * @return the list of databases.
 */
export async function listDatabaseInstances(projectNumber: string): Promise<DatabaseInstance[]> {
  const response = await api.request("GET", `/v1/projects/${projectNumber}/databases`, {
    auth: true,
    origin: api.firedataOrigin,
  });
  if (response.status === 200) {
    return response.body.instance;
  }
  return _handleErrorResponse(response);
}
