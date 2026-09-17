import { api } from "../api";

/*
 * Agent API compatibility layer.
 *
 * The current project already exposes the generic request helper but the
 * agent-specific methods are missing from api.js.  Keeping these methods in
 * one small module lets the existing Agent pages continue to use `api.*`
 * without duplicating request/auth logic.
 */

const agentMethods = {
  getAgentStatus: async () => api.request("/agent/status"),

  getAgentHistory: async () => api.request("/agent/history"),

  getCurrentAgentReport: async () => api.request("/agent/reports/current"),

  submitWeeklyReport: async (reports, weekNumber, year) =>
    api.request("/agent/reports", {
      method: "POST",
      body: {
        week_number: Number(weekNumber),
        year: Number(year),
        reports,
      },
    }),

  getMyEmergingDiseases: async () => api.request("/agent/emerging/mine"),

  submitEmergingDisease: async (payload) =>
    api.request("/agent/emerging", {
      method: "POST",
      body: payload,
    }),
};

Object.assign(api, agentMethods);

export { agentMethods };
export default agentMethods;

