import {
  request,
} from "../api.js";


/*
 * ============================================================
 * ROLE-SCOPED NOTIFICATION API
 * ============================================================
 *
 * This keeps notification APIs separate from the existing
 * general api.js file.
 *
 * Existing api.js does NOT need to be rewritten.
 * ============================================================
 */


const notificationApi = {


  // ==========================================================
  // ADMIN
  // READ ONLY
  // ==========================================================

  getAdminNotifications:
    async () => {

      return request(
        "/admin/notifications"
      );

    },


  // ==========================================================
  // MEDICAL SUPERVISOR
  // ==========================================================

  getSupervisorNotifications:
    async () => {

      return request(
        "/medical/notifications"
      );

    },


  publishSupervisorNotification:
    async (
      payload
    ) => {

      return request(
        "/medical/notifications",
        {
          method:
            "POST",

          body:
            payload,
        }
      );

    },


  // ==========================================================
  // AGENT
  // ==========================================================

  getAgentNotifications:
    async () => {

      return request(
        "/agent/notifications"
      );

    },


  publishAgentNotification:
    async (
      payload
    ) => {

      return request(
        "/agent/notifications",
        {
          method:
            "POST",

          body:
            payload,
        }
      );

    },


  // ==========================================================
  // CITIZEN
  // ==========================================================

  getCitizenNotifications:
    async (
      talukId
    ) => {

      if (
        talukId ===
          undefined ||
        talukId ===
          null ||
        talukId ===
          ""
      ) {

        return [];

      }


      return request(
        `/notifications/${talukId}`
      );

    },

};


export {
  notificationApi,
};


export default notificationApi;