import { api } from "../api";

/*
 * ============================================================
 * AGENT API COMPATIBILITY LAYER
 * ============================================================
 *
 * These methods are kept here because some Agent Portal
 * components may import agentMethods directly.
 */

const agentMethods = {

  // ==========================================================
  // AGENT STATUS
  // ==========================================================

  getAgentStatus: async () => {
    return api.request(
      "/agent/status"
    );
  },

  // ==========================================================
  // AGENT HISTORY
  // ==========================================================

  getAgentHistory: async () => {
    return api.request(
      "/agent/history"
    );
  },

  // ==========================================================
  // CURRENT AGENT REPORT
  // ==========================================================

  getCurrentAgentReport: async () => {
    return api.request(
      "/agent/reports/current"
    );
  },

  // ==========================================================
  // WEEKLY REPORT
  // ==========================================================

  submitWeeklyReport: async (
    reports,
    weekNumber,
    year
  ) => {
    return api.request(
      "/agent/reports",
      {
        method: "POST",

        body: {
          week_number:
            Number(weekNumber),

          year:
            Number(year),

          reports,
        },
      }
    );
  },

  // ==========================================================
  // EMERGING DISEASE REPORTS
  // ==========================================================

  /*
   * IMPORTANT:
   *
   * Do not use /agent/emerging/mine.
   *
   * The backend exposes:
   *
   * GET /agent/emerging
   *
   * and the backend itself scopes the response
   * to the authenticated agent.
   */

  getMyEmergingDiseases: async () => {
    return api.request(
      "/agent/emerging"
    );
  },

  getMyEmergingReports: async () => {
    return api.request(
      "/agent/emerging"
    );
  },

  getAgentEmerging: async () => {
    return api.request(
      "/agent/emerging"
    );
  },

  // ==========================================================
  // SUBMIT EMERGING DISEASE
  // ==========================================================

  submitEmergingDisease: async (
    payload = {}
  ) => {
    const formData =
      new FormData();

    formData.append(
      "reported_name",
      String(
        payload?.reported_name || ""
      ).trim()
    );

    formData.append(
      "report_type",
      String(
        payload?.report_type ||
          "New Disease"
      ).trim()
    );

    formData.append(
      "taluk_id",
      String(
        payload?.taluk_id || ""
      )
    );

    formData.append(
      "observed_date",
      String(
        payload?.observed_date || ""
      )
    );

    formData.append(
      "symptoms",
      String(
        payload?.symptoms || ""
      ).trim()
    );

    formData.append(
      "severity",
      String(
        payload?.severity || ""
      ).trim()
    );

    formData.append(
      "description",
      String(
        payload?.description || ""
      ).trim()
    );

    if (
      payload?.attachment instanceof File
    ) {
      formData.append(
        "attachment",
        payload.attachment
      );
    }

    return api.request(
      "/agent/emerging",
      {
        method: "POST",
        body: formData,
      }
    );
  },

  // ==========================================================
  // UPDATE EMERGING DISEASE
  // ==========================================================

  updateEmergingDisease: async (
    reportId,
    payload = {}
  ) => {

    if (
      reportId === undefined ||
      reportId === null ||
      reportId === ""
    ) {
      throw new Error(
        "A valid emerging disease report ID is required."
      );
    }

    const formData =
      new FormData();

    formData.append(
      "reported_name",
      String(
        payload?.reported_name || ""
      ).trim()
    );

    formData.append(
      "report_type",
      String(
        payload?.report_type ||
          "New Disease"
      ).trim()
    );

    formData.append(
      "taluk_id",
      String(
        payload?.taluk_id || ""
      )
    );

    formData.append(
      "observed_date",
      String(
        payload?.observed_date || ""
      )
    );

    formData.append(
      "symptoms",
      String(
        payload?.symptoms || ""
      ).trim()
    );

    formData.append(
      "severity",
      String(
        payload?.severity || ""
      ).trim()
    );

    formData.append(
      "description",
      String(
        payload?.description || ""
      ).trim()
    );

    if (
      payload?.attachment instanceof File
    ) {
      formData.append(
        "attachment",
        payload.attachment
      );
    }

    return api.request(
      `/agent/emerging/${reportId}`,
      {
        method: "PUT",
        body: formData,
      }
    );
  },
};

Object.assign(
  api,
  agentMethods
);

export {
  agentMethods,
};

export default agentMethods;