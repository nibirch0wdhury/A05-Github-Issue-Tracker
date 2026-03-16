document.getElementById('sign-in-btn').addEventListener('click', function () {
            var user = document.getElementById('txt-user').value.trim();
            var pass = document.getElementById('txt-pass').value;

            if (user !== 'admin') {
                alert('Username should be admin');
                return;
            }
            if (pass !== 'admin123') {
                alert('Wrong password');
                return;
            }

            window.location.href = './homePage.html';
        });