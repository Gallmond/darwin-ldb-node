class MethodNotFoundError extends Error{
  constructor(path: string){
    super(`No method found for ${path}`)
  }
}

class MethodCallError extends Error{}

class ResponseParseError extends Error{
  constructor(data: unknown){
    super(`Error parsing response`)
    console.error(this.message, data)
  }
}

export { MethodNotFoundError, MethodCallError, ResponseParseError }
