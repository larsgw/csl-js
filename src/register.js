import parseXml from './parse'

class Register {
  constructor (entries) {
    this.data = {}

    if (Array.isArray(entries)) {
      for (const [key, value] of entries) {
        this.set(key, value)
      }
    }
  }

  get (key) {
    return this.data[key]
  }

  set (key, value) {
    this.data[key] = parseXml(value)
    return this
  }

  has (key) {
    return Object.prototype.hasOwnProperty.call(this.data, key)
  }

  delete (key) {
    delete this.data[key]
    return this
  }

  keys () {
    return Object.keys(this.data)
  }
}

export default Register
