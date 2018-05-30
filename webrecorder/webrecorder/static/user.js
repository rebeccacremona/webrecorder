$(function(){

    $(".ispublic").bootstrapSwitch();

    $('#news-alert').on('close.bs.alert', function () {
        setStorage("__wr_skipNews", "1");
    });

    if(getStorage("__wr_skipNews") === "1") {
      $('#news-alert').hide();
    }

    $('#news-alert-top').on('close.bs.alert', function () {
        setStorage("__wr_skipMt", "1");
    });

    if(getStorage("__wr_skipMt") === "1") {
      $('#news-alert-top').hide();
    }


    $('#create-modal').on('shown.bs.modal', function () {
        $('#title').select();
    });
});
