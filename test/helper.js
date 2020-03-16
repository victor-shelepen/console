const _console = {
  objects: [],
  log: function(object) {
    this.objects.push(object)
  }
}

module.exports = {
  _console
}
