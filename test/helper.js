const _console = {
  objects: [],
  clear: function() {
    this.objects = []
  },
  log: function(object) {
    this.objects.push(object)
  }
}

module.exports = {
  _console
}
