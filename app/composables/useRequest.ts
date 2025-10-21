export const useRequest = () => {
    const get = async (url) => {
      const request = fetch('http://localhost:8080' + url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      }).then(response => {
        return response.json()
      }).then(data => {
        return data
      })   
      return request
    }
  
    return {get}
  }