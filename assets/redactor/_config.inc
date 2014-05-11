<script type="text/javascript" src="redactor/redactor.js"></script>
<link rel="stylesheet" href="redactor/edit.css" type="text/css" />
<link rel="stylesheet" href="redactor/redactor.css" type="text/css" />
<script type="text/javascript" charset="utf-8"> 
$(function() {

	$('textarea.redactor').each(function(i,o){
		var self = $(o);

		self.wrap('<div class="editor-wrap" style="float:left;"></div>')
		self.redactor({ 
		imageUpload: '/upload.php',
		fileUpload: '/upload_file.php',
		uploadFields: {
			'width': self.attr('data-width')||'',
			'height': self.attr('data-height')||'',
			'crop': self.attr('data-crop')||''
		}
	})

	});
});
</script> 
