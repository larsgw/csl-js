import parseXml from './parse'

class Register {
  constructor (data) {
    this.data = data ? Object.assign({}, data) : {}
  }

  get (key) {
    return this.data[key]
  }

  set (key, value) {
    this.data[key] = parseXml(value)
    return this
  }

  add (...args) {
    return this.set(...args)
  }

  has (key) {
    return this.data.hasOwnProperty(key)
  }

  delete (key) {
    delete this.data[key]
    return this
  }

  list () {
    return Object.keys(this.data)
  }
}

export default Register
