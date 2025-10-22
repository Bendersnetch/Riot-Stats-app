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

  const post = async (url: string, data?: any, config?: AxiosRequestConfig) => {
    const response = await instance.post(url, data, config)
    return response.data
  }

  const put = async (url: string, data?: any, config?: AxiosRequestConfig) => {
    const response = await instance.put(url, data, config)
    return response.data
  }

  const patch = async (url: string, data?: any, config?: AxiosRequestConfig) => {
    const response = await instance.patch(url, data, config)
    return response.data
  }

  const del = async (url: string, config?: AxiosRequestConfig) => {
    const response = await instance.delete(url, config)
    return response.data
  }

  return {
    get,
    post,
    put,
    patch,
    delete: del
  }
}
