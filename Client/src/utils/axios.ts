import axios from "axios";

const URL = import.meta.env.VITE_BASE_URL || "http://localhost:3000";

const apiClient = axios.create({
  baseURL: URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const callApi = async ({
  path,
  method = "GET",
  value = null,
}: {
  path: string;
  method: string;
  value?: object | null | undefined;
}) => {
  try {
    const response = await apiClient({
      url: path,
      method: method.toUpperCase(),
      data: value,
    });

    return response.data;
  } catch (error) {
    console.error(
      `Error in API call to ${path}:`,
      error.response.data || error.message
    );
    console.log("Error: ", error);
    throw error.response.data || error.message;
  }
};

export default callApi;
