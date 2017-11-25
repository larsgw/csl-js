class Register {
  data = {}

  constructor (data = {}) {
    Object.assign(this.data, data)
  }

  get (key) {
    return this.data[key]
  }

  set (key, value) {
    this.data[key] = value
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
