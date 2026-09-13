const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "http://127.0.0.1:8000";


/* ============================================================
   AUTH
============================================================ */

const getToken = () =>
  sessionStorage.getItem(
    "kt_token"
  );


/* ============================================================
   ERROR
============================================================ */

const getErrorMessage =
  async (response) => {

    try {

      const data =
        await response.json();

      return (
        data?.detail ||
        data?.message ||
        `Request failed with status ${response.status}.`
      );

    } catch {

      return `Request failed with status ${response.status}.`;

    }
  };


/* ============================================================
   ADMIN REPORT MANAGEMENT
============================================================ */

export async function
getAdminReportManagementReports(
  params = {}
) {

  const search =
    new URLSearchParams();


  Object.entries(
    params
  ).forEach(
    ([key, value]) => {

      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {

        search.set(
          key,
          String(value)
        );

      }

    }
  );


  const query =
    search.toString();


  const response =
    await fetch(
      `${API_BASE}/admin/report-management/reports${
        query
          ? `?${query}`
          : ""
      }`,
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",

          ...(getToken()
            ? {
                Authorization:
                  `Bearer ${getToken()}`,
              }
            : {}),
        },
      }
    );


  if (!response.ok) {

    throw new Error(
      await getErrorMessage(
        response
      )
    );

  }


  return response.json();
}