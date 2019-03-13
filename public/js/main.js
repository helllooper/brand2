$(document).ready(function() {

	$('.addArticle').on('submit', function(event) {

		event.preventDefault();

		var formData = new FormData($('.addArticle')[0]);

		$.ajax({
			xhr : function() {
				var xhr = new window.XMLHttpRequest();

				xhr.upload.addEventListener('progress', function(e) {

					if (e.lengthComputable) {

                      var percent = Math.round((e.loaded / e.total) * 100);
                      $(".progress").css("display", "initial");
                      $('#progressBar').attr('aria-valuenow', percent).css('width', percent + '%').text(percent + '%');

					}

				});

				return xhr;
			},
			method : 'POST',
			url : '/add',
			data : formData,
			processData : false,
			contentType : false,
			success : function(response) {
			    window.location.href = "/";
             }
		});

	});
	
	$('.addVideo').on('submit', function(event) {

		event.preventDefault();

		var formData = new FormData($('.addVideo')[0]);

		$.ajax({
			xhr : function() {
				var xhr = new window.XMLHttpRequest();

				xhr.upload.addEventListener('progress', function(e) {

					if (e.lengthComputable) {

                      var percent = Math.round((e.loaded / e.total) * 100);
                      $(".progress").css("display", "initial");
                      $('#progressBar').attr('aria-valuenow', percent).css('width', percent + '%').text(percent + '%');

					}

				});

				return xhr;
			},
			method : 'POST',
			url : '/addVideo',
			data : formData,
			processData : false,
			contentType : false,
			success : function(response) {
			    window.location.href = "/";
             }
		});

	});

});
 $("#searchButton").on('click', function (e) {
 	 e.preventDefault();
     $("#search").addClass("d-flex");
 });
 
  $("#closeButton").on('click', function (e) {
 	 e.preventDefault();
     $("#search").removeClass("d-flex");
 });