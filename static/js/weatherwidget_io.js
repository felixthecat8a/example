const weatherwidget = document.getElementById("weatherwidget")
weatherwidget.innerHTML = (`
<style>
    #weather{
        margin:5px;
        padding:5px;
        border-style:solid;
        border-color:lightseagreen;
        border-radius:0.3rem;
    }
</style>
<a class="weatherwidget-io" href="https://forecast7.com/en/26d30n98d16/edinburg/?unit=us" data-label_1="EDINBURG, TX" data-label_2="WEATHER" data-icons="Climacons" data-theme="gray" data-basecolor="#333333" data-highcolor="#ffb2b2" data-lowcolor="#a5c9ff" data-suncolor="#ecff5a" >EDINBURG WEATHER</a>
<!--script>
    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');
</script-->    
`)

!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src='https://weatherwidget.io/js/widget.min.js';fjs.parentNode.insertBefore(js,fjs);}}(document,'script','weatherwidget-io-js');
