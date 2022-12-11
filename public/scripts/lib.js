const checkAuth = () => {
  $.ajax({
    type: 'POST',
    beforeSend: function (request) {
      request.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'))
    },
    url: '/check',
  }).done(function (data) {
    const { success } = data
    const route = location.pathname
    if (success && (route == '/login' || route == '/register')) {
      window.location.href = '/'
      return
    }
    if (!success && route != '/login' && route != '/register') {
      window.location.href = '/login'
      return
    }
  })
}

const logout = () => {
  $.ajax({
    type: 'POST',
    beforeSend: function (request) {
      request.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('token'))
    },
    url: '/logout',
  }).done(function () {
    localStorage.removeItem('token')
    window.location.href = '/login'
  })
}
