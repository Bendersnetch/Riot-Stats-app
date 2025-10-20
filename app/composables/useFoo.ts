export const useFoo = () => {
  
    const get = async (url) => {
      return await fetch('http://localhost:8080' + url)
    }
  
    return {get}
  }


