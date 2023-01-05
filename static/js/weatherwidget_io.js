const weatherwidget = document.getElementById("weatherwidget")

weatherwidget.innerHTML = (`
<style>#weatherwidget{margin:0;padding:0;border-style:solid;border-width: thick;border-color:#a5ffc9;border-radius:0.3rem;}</style>
<a class="weatherwidget-io" href="https://forecast7.com/en/26d29n98d31/alton/?unit=us" data-label_1="ALTON, TX" data-label_2="WEATHER" data-font="Roboto" data-icons="Climacons" data-theme="gray" data-basecolor="#333333" data-highcolor="#ffb2b2" data-lowcolor="#a5c9ff" data-suncolor="#ecff5a" data-raincolor="#a5c9ff" >ALTON, TX WEATHER</a>
<!--script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');</script-->    
`)

!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js'); 
