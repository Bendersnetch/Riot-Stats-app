import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios'

export function useRequest() {
  const config = useRuntimeConfig()

  const instance: AxiosInstance = axios.create({
    baseURL: config.public.apiBaseUrl,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  const get = async (url: string, config?: AxiosRequestConfig) => {
    const response = await instance.get(url, config)
    return response.data
  }

  return {
    get
  }
}
