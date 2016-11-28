Biojs.AnnotatorAction = Biojs.AnnotatorBase.extend(
/** @lends Biojs.Annotator# */
{
	constructor: function(options){
		
	},
	
	 /** 
	    * Default options (and its values) for the Citation component. 
	    * @name Biojs.Citation-opt
	    * @type Object
	    */
	opt: {
	},
	
	 /**
	 * Array containing the supported event names
	 * @name Biojs.Citation-eventTypes
	 */
	eventTypes : [
	],
	
	
	_createBlockAnnotation: function (annotationData, startIndex, type, containerMenu, rdfAnnotationDiv, xpos, ypos, pmcid, pos){
		
		var menuAnnotationTypeContainer = jQuery("<span class=\"menu_annotation_type\"></span>").appendTo(containerMenu);
		
		jQuery("<span class=\"menu_annotation_type_title\">"+this._getAnnotationLabelGeneral(annotationData[startIndex].data, annotationData[startIndex].annotator)+"</span>").appendTo(menuAnnotationTypeContainer);
		
		var k = startIndex;
		
		var currentAnnotationData;
		
		var menuAnnotationSingleContainer;
		
		var menuAnnotationSingleLinksContainer;
		
		for (k=startIndex; k<annotationData.length; k++){ 
			currentAnnotationData =  annotationData[k];
			
			typeAnnotation = this._getAnnotationTypeGeneral(currentAnnotationData.data, currentAnnotationData.annotator);
			
			if (typeAnnotation==type){
				
				text = this._getAnnotationTextGeneral(currentAnnotationData.data, currentAnnotationData.annotator);
				url =  this._getAnnotationUrlGeneral(currentAnnotationData.data, currentAnnotationData.annotator);
				
				menuAnnotationSingleContainer = jQuery("<span class=\"menu_annotation_single\"></span>").appendTo(menuAnnotationTypeContainer);
				
				//title
				jQuery("<span class=\"menu_annotation_single_title\">"+text+"</span>").appendTo(menuAnnotationSingleContainer);
				
				//links
				menuAnnotationSingleLinksContainer = jQuery("<span class=\"menu_annotation_single_links\"></span>").appendTo(menuAnnotationSingleContainer);
				
				var idPdbContainerLink=rdfAnnotationDiv+"_"+k+"_pdbstructure";
				var idPdbContainer=rdfAnnotationDiv+"_container_pdb_"+k;
				
				var urlRefineSearch = this._getAnnotationUrlEPMCsearchRefineGeneral(currentAnnotationData.data,  currentAnnotationData.annotator);
				
				var linkRefineSearch="";
				var linkSearchArticle="";
				if (urlRefineSearch!=""){
					linkRefineSearch=" <span class=\"menu_annotation_refine_search\" id=\""+rdfAnnotationDiv+"_"+k+"_refinesearchepmc\"><i class=\"fa fa-search\" style=\"color:#62a744;\"></i> Refine Search</span>";
				}else{
					linkSearchArticle=" <span class=\"menu_annotation_search\" id=\""+rdfAnnotationDiv+"_"+k+"_searchepmc\"><i class=\"fa fa-search\" style=\"color:#62a744;\"></i> Search Articles</span>";
				}
				
				//links
				menuAnnotationSingleLinksContainer.html("<span class=\"menu_annotation_single_links_text\"><span class=\"menu_annotation_details\" id=\""+rdfAnnotationDiv+"_"+k+"_details\"><i class=\"fa fa-external-link\" style=\"color:#62a744;\"></i> "+this._getAnnotationDetailsLinkGeneral(currentAnnotationData.annotator, typeAnnotation, url)+"</span> |"+linkRefineSearch+linkSearchArticle+ "</span><span id=\""+rdfAnnotationDiv+"_"+k+"_feedback\" class=\"menu_annotation_feedback\">Feedback <i class=\"fa fa-caret-down fa-1x\" style=\"color:#494949;\"></i></span><span id=\"feedback_form_choice"+rdfAnnotationDiv+"_"+k+"\"></span>");
				
				//provider
				 jQuery("<span class=\"menu_annotation_provider\">Annotation source: "+this._getAnnotationProviderGeneral(annotationData[startIndex].annotator)+"</span>").appendTo(menuAnnotationSingleContainer);
				 
				
				 if ((type== Biojs.AnnotatorBase.ACCESSION_NUMBERS) && (this._startsWith(url.toLowerCase(),"http://identifiers.org/pdb/"))){ 
					 jQuery("<div class=\"pdb_visualization\" id=\""+idPdbContainer+"\"+></div>").appendTo(menuAnnotationSingleContainer);
					 jQuery("<div class=\"pdb_visualization_loading\" id=\""+idPdbContainer+"_loading\"+><div class=\"pdb_visualization_loading_icon\"><i class=\"fa fa-cog fa-spin fa-3x\"></i></div><div class=\"pdb_visualization_loading_label\">Loading PDB structure...</div></div>").appendTo(menuAnnotationSingleContainer);
				 }
				
				
				this._linkActionClick(type, url, rdfAnnotationDiv, k, currentAnnotationData, xpos, ypos, idPdbContainer, idPdbContainerLink, urlRefineSearch, pmcid, pos);
				
				if (k==(annotationData.length - 1)){
					menuAnnotationTypeContainer.css("border-bottom","0px");
				}
				
			}
			
		}	
		
	},
	
	_isAnnotationTypeAnalyzed: function (annotationTypes, type){
		for (var i=0;i<annotationTypes.length; i++){
			if (annotationTypes[i]==type){
				return true;
			}
		}
		
		return false;
	},
	
	
	_openPdbStructures: function(annotationData, rdfAnnotationDiv, xpos, ypos) {
		
		var titleDialog="INFO ";
		var sizeWindow;
		var self=this;
		var type;
		var text;
		var url;
		
		var k = 0;
		var currentAnnotationData;
		for (k=0; k<annotationData.length; k++){ 
			currentAnnotationData =  annotationData[k];
			
			type = this._getAnnotationTypeGeneral(currentAnnotationData.data, currentAnnotationData.annotator);
			url =  this._getAnnotationUrlGeneral(currentAnnotationData.data, currentAnnotationData.annotator);
			
			if ((type== Biojs.AnnotatorBase.ACCESSION_NUMBERS) && (this._startsWith(url.toLowerCase(),"http://identifiers.org/pdb/"))){ 
				var idPdbContainerLink=rdfAnnotationDiv+"_"+k+"_pdbstructure";
				var idPdbContainer=rdfAnnotationDiv+"_container_pdb_"+k;
				this._showPDBstructure(currentAnnotationData.data, rdfAnnotationDiv, xpos, ypos, currentAnnotationData.annotator, idPdbContainer, idPdbContainerLink);
			}
		
		}
   },
	
	load: function(annotationData, rdfAnnotationDiv, orderInfo, xpos, ypos, pmcid, pos) {
		
		var titleDialog="INFO ";
		var sizeWindow;
		var self=this;
		var type;
		var text;
		var url;
		
		var annotationTypes = [];
		
		
		jQuery("#"+rdfAnnotationDiv).dialog("destroy");
		
		jQuery("#"+rdfAnnotationDiv).html("<span class=\"menu_annotation_rdf\"></span>");
		var containerMenu = jQuery("#"+rdfAnnotationDiv+" .menu_annotation_rdf");
		
		var k = 0;
		var currentAnnotationData;
		for (k=0; k<annotationData.length; k++){ 
			currentAnnotationData =  annotationData[k];
			
			type = this._getAnnotationTypeGeneral(currentAnnotationData.data, currentAnnotationData.annotator);
			
			if (this._isAnnotationTypeAnalyzed(annotationTypes, type)==false){
				this._createBlockAnnotation(annotationData, k, type, containerMenu, rdfAnnotationDiv, xpos, ypos, pmcid, pos);
				annotationTypes[annotationTypes.length] = type;
			}
		
		}
		
		var sizeWindow = 440;
		
		jQuery("#"+rdfAnnotationDiv).dialog({
             autoOpen: true, 
             hide: "puff",
             show : "slide",
             height:"auto",
             width:"auto",
             title: '',
             modal:true,
             position:[xpos - 20 , ypos + 22],
             draggable: false,
             open: function(){
                 jQuery('.ui-widget-overlay').bind('click',function(){
                     self. _unload(annotationData, rdfAnnotationDiv);
                 });
                
                 jQuery(this).parent().promise().done(function () {
                	 self._openPdbStructures(annotationData, rdfAnnotationDiv, xpos, ypos);
                	 PiwikAnalyticsTracker.tracking();
                 });
                 
             },
             dialogClass: 'noTitleDialogRDF',
             closeText: ''
          });
		
	},
	
	_linkActionClick: function(type, url, rdfAnnotationDiv, k, currentAnnotationData, xpos, ypos, idPdbContainer, idPdbContainerLink, urlRefineSearch, pmcid, pos){
	    var self=this;
	    	
	    jQuery("#"+rdfAnnotationDiv+"_"+k+"_details").off("click");
		jQuery("#"+rdfAnnotationDiv+"_"+k+"_details").on("click", function(){self._openDetails(currentAnnotationData.data, rdfAnnotationDiv, currentAnnotationData.annotator)});
		
		jQuery("#"+rdfAnnotationDiv+"_"+k+"_feedback").off("click");
		jQuery("#"+rdfAnnotationDiv+"_"+k+"_feedback").on("click", function(pos){self._openChoiceFeedbackForm(currentAnnotationData.data, rdfAnnotationDiv, currentAnnotationData.annotator, pos.clientX, pos.clientY, pmcid, k, pos);});
		
		if (jQuery("#"+rdfAnnotationDiv+"_"+k+"_searchepmc")!=undefined && jQuery("#"+rdfAnnotationDiv+"_"+k+"_searchepmc").length>0){
			jQuery("#"+rdfAnnotationDiv+"_"+k+"_searchepmc").off("click");
			jQuery("#"+rdfAnnotationDiv+"_"+k+"_searchepmc").on("click", function(){self._openEPMCsearch(currentAnnotationData.data, rdfAnnotationDiv, currentAnnotationData.annotator)});
		}
			
		if (jQuery("#"+rdfAnnotationDiv+"_"+k+"_refinesearchepmc")!=undefined && jQuery("#"+rdfAnnotationDiv+"_"+k+"_refinesearchepmc").length>0){
			jQuery("#"+rdfAnnotationDiv+"_"+k+"_refinesearchepmc").off("click");
			jQuery("#"+rdfAnnotationDiv+"_"+k+"_refinesearchepmc").on("click", function(){self._openEPMCsearchRefined(urlRefineSearch)});
		}
	},
	
    _unload: function(annotationData, rdfAnnotationDiv) {
		jQuery("#"+rdfAnnotationDiv).dialog("close");
		jQuery("#"+rdfAnnotationDiv).dialog("destroy");
		jQuery("#"+rdfAnnotationDiv).html('');
	},
	
	_hidePDBstructure: function(annotationData, rdfAnnotationDiv, xpos, ypos, annotator, idPdbContainer, idPdbContainerLink) {
		if(jQuery('#'+idPdbContainer).is(':visible')==true){
			jQuery("#"+idPdbContainer).toggle(0);
			jQuery("#"+idPdbContainerLink+" i").attr("class","fa fa-caret-down fa-1x");
			jQuery("#"+idPdbContainerLink).off("click");
			var self=this;
			jQuery("#"+idPdbContainerLink).on("click", function(pos){self._showPDBstructure(annotationData, rdfAnnotationDiv, xpos, ypos, annotator, idPdbContainer, idPdbContainerLink)});
		}
	},
	
	_showPDBstructure: function(annotationData, rdfAnnotationDiv, xpos, ypos, annotator, idPdbContainer, idPdbContainerLink) {
		
		if(jQuery('#'+idPdbContainer).is(':visible')==false){
			var self=this;
			if(jQuery('#'+idPdbContainer).html()==undefined || jQuery('#'+idPdbContainer).html()==""){ 
				var size=460;
				
				jQuery("#"+idPdbContainer+"_loading .fa-cog").css("margin-top", "50px");
				jQuery("#"+idPdbContainer+"_loading").toggle(0);
				
				var instancePdb = new Biojs.Protein3DCanvas({
					target: idPdbContainer,
					jsmolFolder: '/bioJs/dependencies/jsmol-14.4.4/jsmol',
					height: size,
			    	width: size,
			    	style: Biojs.Protein3D.STYLE_CARTOON,
			    	loadingStatusImage:"/images/ajax-loader.gif",
			    	use:"HTML5 JAVA",
			    	proxyUrl:"/bioJs/jsmol.jsp",
			    	viewControls: false,
			    });
				
				var text= this._getAnnotationTextGeneral(annotationData, annotator);
				instancePdb.setPdb(text.toLowerCase());
				
				instancePdb.onPdbLoaded(function (e){
					//sleep(10000);
					jQuery("#"+idPdbContainer+"_loading").toggle(0);
					jQuery("#"+idPdbContainer).toggle(0);
					
				});
			}else{
				jQuery("#"+idPdbContainer).toggle(0);
				
			}
			
		}
	},
	
	_highlightall: function(annotator, annotationData, rdfAnnotationDiv) {
		this._unload(annotationData, rdfAnnotationDiv);
		
		annotator.highlightAnnotationFromContextualMenu(annotationData);
		
	},
	
	_highlightfirst: function(annotator, annotationData, rdfAnnotationDiv) {
		this._unload(annotationData, rdfAnnotationDiv);
		
		annotator.highlightOnlyFirstAnnotationFromContextualMenu(annotationData);

	},
	
	_openDetails: function(annotationData, rdfAnnotationDiv, annotator) {
		//this._unload([annotationData], rdfAnnotationDiv);
		var url = this._getAnnotationUrlGeneral(annotationData, annotator);
		window.open(url,"_blank");
	},
	
	_openEPMCsearch: function(annotationData, rdfAnnotationDiv, annotator) {
		var url = this._getAnnotationUrlEPMCsearchGeneral(annotationData, annotator);
		window.open(url,"_blank");
	},
	
	_openEPMCsearchRefined: function(urlToOpen) {
		window.open(urlToOpen,"_blank");
	},
	
	_openFeedbackForm: function(annotationData, rdfAnnotationDiv, annotator, xpos, ypos, pmcid, k){
		var self=this;
		var htmlForm="<div class=\"title_feedback_annotation\">Report problem annotation</div>";
		var text= this._getAnnotationTextGeneral(annotationData, annotator);
		htmlForm = htmlForm+"<div class=\"label_feedback_annotation\"> What's wrong with this instance of <span class=\"text_feedback_annotation\">\""+text+"\"</span>?</div>";
		
		htmlForm = htmlForm+"<div  class=\"radiobutton_feedback_annotation\">";
		htmlForm = htmlForm+"<div  class=\"radiobutton_feedback_annotation_element\"><input type=\"radio\" name=\"annotation_feedback\" checked=\"checked\" value=\"incorrect\"/> It is incorrect </div>"; 
		htmlForm = htmlForm+"<div  class=\"radiobutton_feedback_annotation_element\"><input type=\"radio\" name=\"annotation_feedback\" value=\"too_generic\"/> Too Generic </div>"; 
		htmlForm = htmlForm+"<div  class=\"radiobutton_feedback_annotation_element\"><input type=\"radio\" name=\"annotation_feedback\" value=\"other\"/> Other</div>"; 
		htmlForm = htmlForm+"</div>";  
		
		htmlForm = htmlForm+"<div class=\"label_feedback_annotation\">";
		htmlForm = htmlForm+" It would be really helpful if you could briefly explain the problem <i>(optional)</i>";
		htmlForm = htmlForm+"</div>"; 
		
		htmlForm = htmlForm+"<div class=\"textarea_feedback_annotation\">";
		htmlForm = htmlForm+"<textarea id=\"annotation_comment\" name=\"annotation_comment\"></textarea>";
		htmlForm = htmlForm+"</div>"; 
		
		htmlForm = htmlForm+"<div class=\"label_feedback_annotation\">";
		htmlForm = htmlForm+" Email <i>(optional)</i>";
		htmlForm = htmlForm+"</div>"; 
		
		htmlForm = htmlForm+"<div class=\"email_feedback_annotation\">";
		htmlForm = htmlForm+"<input size=\"40\" type=\"text\" id=\"email_user"+rdfAnnotationDiv+"_"+k+"\" name=\"email_user\"/>";
		htmlForm = htmlForm+"<div id=\"email_userError"+rdfAnnotationDiv+"_"+k+"\" class=\"error_text formInputClientError email_feedback_annotation_error\" style=\"display:none\"/></div>";
		htmlForm = htmlForm+"</div>"; 
		
		htmlForm = htmlForm+"<div class=\"button_feedback_annotation\">";
		htmlForm = htmlForm+"<input type=\"button\" id=\"cancel_feedback_annotation"+rdfAnnotationDiv+"_"+k+"\" class=\"clear_button secondary\" value=\"Cancel\"/> <input type=\"button\" id=\"send_feedback_annotation"+rdfAnnotationDiv+"_"+k+"\" class=\"submit_button\" value=\"Send Feedback\"/>";
		htmlForm = htmlForm+"</div>"; 
		
		jQuery("#"+rdfAnnotationDiv).html(htmlForm);
		
		
		jQuery("#cancel_feedback_annotation"+rdfAnnotationDiv+"_"+k).off("click");
		jQuery("#cancel_feedback_annotation"+rdfAnnotationDiv+"_"+k).on("click", function(){self._cancelFeedbackForm(annotationData, rdfAnnotationDiv, annotator, xpos, ypos)});
		
		jQuery("#send_feedback_annotation"+rdfAnnotationDiv+"_"+k).off("click");
		jQuery("#send_feedback_annotation"+rdfAnnotationDiv+"_"+k).on("click", function(){self._sendFeedbackForm(annotationData, rdfAnnotationDiv, annotator, xpos, ypos, jQuery('#annotation_comment').val(), jQuery("input[type='radio'][name='annotation_feedback']:checked").val(), jQuery("#email_user"+rdfAnnotationDiv+"_"+k).val(), pmcid, k)});
		
		jQuery("#email_user"+rdfAnnotationDiv+"_"+k).off("keydown");
		jQuery("#email_user"+rdfAnnotationDiv+"_"+k).on("keydown", function(){
			self._validateEmail(jQuery(this).val(),  rdfAnnotationDiv, k);
               
		});
		
		jQuery("#email_user"+rdfAnnotationDiv+"_"+k).off("keyup");
		jQuery("#email_user"+rdfAnnotationDiv+"_"+k).on("keyup", function(){
			self._validateEmail(jQuery(this).val(), rdfAnnotationDiv, k);
               
		});
		
	},
	
	_openThanksFeedback: function(resp, annotationData, rdfAnnotationDiv, k){
		//this._closeChoiceFeedbackForm(annotationData, rdfAnnotationDiv);
		var self=this;
		var htmlForm="";
		
		htmlForm="<div class=\"title_feedback_annotation\">Thanks for your feedback!</div>";
		htmlForm = htmlForm+"<div class=\"label_feedback_annotation\">Our support staff will review your comments soon.</div>";
		htmlForm = htmlForm+"<div class=\"label_feedback_annotation\">With your help we will improve the quality and relevance of annotations.</div>";
		
		htmlForm = htmlForm+"<div class=\"button_feedback_annotation\">";
		htmlForm = htmlForm+"<input type=\"button\" id=\"close_feedback_annotation"+rdfAnnotationDiv+"_"+k+"\" class=\"submit_button\" value=\"Finish\"/>";
		htmlForm = htmlForm+"</div>"; 
		
		
		jQuery("#"+rdfAnnotationDiv).html(htmlForm);
		
		jQuery("#close_feedback_annotation"+rdfAnnotationDiv+"_"+k).off("click");
		jQuery("#close_feedback_annotation"+rdfAnnotationDiv+"_"+k).on("click", function(){self._unload(annotationData, rdfAnnotationDiv)});
		
	},
	
	_cancelFeedbackForm: function(annotationData, rdfAnnotationDiv, annotator, xpos, ypos){
		this._unload(annotationData, rdfAnnotationDiv);
	},
	
	_sendFeedbackForm: function(annotationData, rdfAnnotationDiv, annotator, xpos, ypos, commentText, radioButtonValue, email, pmcid, k){
		
		if (this._validateEmail(email,  rdfAnnotationDiv, k)){
			var text= this._getAnnotationTextGeneral(annotationData, annotator);
			var messageMail = 'Comment on '+text +' was '+radioButtonValue+' with text value '+commentText;
			var type= this._getAnnotationTypeGeneral(annotationData, annotator);
			var prefix= this._getAnnotationPrefixGeneral(annotationData, annotator);
			var postfix= this._getAnnotationPostfixGeneral(annotationData, annotator);
			var uri= this._getAnnotationUriGeneral(annotationData, annotator);
			var body= this._getAnnotationBodyGeneral(annotationData, annotator);
			
			var self=this;
			
			jQuery.ajax({
	            type: "GET",
	            url: "../java/sendFeedbackAnnotation.jsp",
	            dataType: 'html',
	            encoding:"UTF-8",
	            contentType: "text/plain; charset=UTF-8",
	            processData: true,
	            data: {"feedback_message": commentText, "judge":radioButtonValue, "semantic_type": type, "exact": text, "prefix":prefix, "postfix": postfix, "email":email, "pmcid": pmcid, "uri": uri, "body": body},
	            headers: {
	                Accept: "application/json",
	                "Access-Control-Allow-Origin": "*"
	            },
	            success: function(resp){
	            	self._openThanksFeedback(resp, annotationData, rdfAnnotationDiv, k);
	              
	            },
	            error: function(e) {
	            	self._openThanksFeedback("KO", annotationData, rdfAnnotationDiv, k);
	            }
	      });
		}
	},
	
	_openChoiceFeedbackForm: function(annotationData, rdfAnnotationDiv, annotator, xpos, ypos, pmcid, k, pos){
		var self=this;
		
		
		self._closeChoiceFeedbackForm(annotationData, rdfAnnotationDiv, k);
		
		var htmlFormChoice="<div id=\"feedback_form_negative_"+rdfAnnotationDiv+"_"+k+"\" class=\"choice_feedback_annotation\"><div class=\"choice_feedback_annotation_text negative_annotation_feedback\"><i class=\"fa  fa-warning\"></i> Report problem with annotation</div></div>";
		htmlFormChoice=htmlFormChoice+"<div id=\"feedback_form_positive_"+rdfAnnotationDiv+"_"+k+"\" class=\"choice_feedback_annotation\"><div class=\"choice_feedback_annotation_text positive_annotation_feedback\"><i class=\"fa fa-thumbs-o-up\"></i> Endorse annotation</div></div>";
		
		jQuery("#feedback_form_choice"+rdfAnnotationDiv+"_"+k).html(htmlFormChoice);
		
		
		jQuery("#feedback_form_negative_"+rdfAnnotationDiv+"_"+k).off("click");
		jQuery("#feedback_form_negative_"+rdfAnnotationDiv+"_"+k).on("click", function(){self._closeChoiceFeedbackForm(annotationData, rdfAnnotationDiv, k); self._openFeedbackForm(annotationData, rdfAnnotationDiv, annotator, xpos, ypos, pmcid, k)});
		
		jQuery("#feedback_form_positive_"+rdfAnnotationDiv+"_"+k).off("click");
		jQuery("#feedback_form_positive_"+rdfAnnotationDiv+"_"+k).on("click", function(){self._closeChoiceFeedbackForm(annotationData, rdfAnnotationDiv, k); self._sendFeedbackForm(annotationData, rdfAnnotationDiv, annotator, xpos, ypos, "", "good", "", pmcid, k)});
		
		
		
		jQuery("#feedback_form_choice"+rdfAnnotationDiv+"_"+k).dialog({
            autoOpen: true, 
            hide: "puff",
            show : "slide",
            height:"auto",
            width:"auto",
            title: '',
            modal:true,
            position:[xpos - 200 , ypos + 10],
            draggable: false,
            open: function(){
                jQuery('.ui-widget-overlay').bind('click',function(){
                	self._closeChoiceFeedbackForm(annotationData, rdfAnnotationDiv, k);
                });
                
            },
            dialogClass: 'choiceFeedbackRDF',
            closeText: ''
         });
		
		
	},
	
	_closeChoiceFeedbackForm: function(annotationData, rdfAnnotationDiv, k){
		jQuery("#feedback_form_choice"+rdfAnnotationDiv+"_"+k).dialog("close");
		jQuery("#feedback_form_choice"+rdfAnnotationDiv+"_"+k).dialog("destroy");
		jQuery("#feedback_form_choice"+rdfAnnotationDiv+"_"+k).html('');
	},
	
	_validateEmail: function(email, rdfAnnotationDiv, k){
		var retEmail;
	    if(email==undefined || email.length == 0 || email==""){ 
	    	retEmail = true;
	    }else{
	    	var emailRE = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
	    	retEmail = emailRE.test(email);
	    }
		
	    if (retEmail){
            jQuery("#email_user"+rdfAnnotationDiv+"_"+k).css("border", "1px solid #999");
			
			jQuery("#email_userError"+rdfAnnotationDiv+"_"+k).text("");
			jQuery("#email_userError"+rdfAnnotationDiv+"_"+k).hide();
		}else{
			jQuery("#email_user"+rdfAnnotationDiv+"_"+k).css("border", "1px solid  red");
			
			jQuery("#email_userError"+rdfAnnotationDiv+"_"+k).text("Enter a valid email address.");
			jQuery("#email_userError"+rdfAnnotationDiv+"_"+k).show();
		}
	    
	    return retEmail;
	}
	
	
},{
});