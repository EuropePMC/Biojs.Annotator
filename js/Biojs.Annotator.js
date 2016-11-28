
Biojs.Annotator = Biojs.AnnotatorBase.extend(
/** @lends Biojs.Annotator# */
{
	constructor: function(options){
		
		if (this.opt.proxyUrl == undefined){
			this.opt.proxyUrl= '../biojs/dependencies/proxy/proxy.php';
		}
		
		this._className= Biojs.AnnotatorBase.CLASSNAME_RDF;
	},
	
	 /** 
	    * Default options (and its values) for the Citation component. 
	    * @name Biojs.Citation-opt
	    * @type Object
	    */
	opt: {
	   target: undefined,
	   pmcId: undefined,
	   idLegend:'',
	   splitInterval: 800,
	   splitSize:100,
	   loadingStatusImage:"/images/spin_annotatations.gif"
	},
	
	_annotationsData:[],
	_annotationsMarked:[],
	_annotationsHighlighted:[],
	_annotationsCompletelyMarked:[],
	_idAnnotationsMarked:[],
	_indexStart: -1,
	_indexStartElaboration: -1,
	_annotationStartIndex: 0,
	_timeElapsed: 0,
	_dataResult: [],
	_dataResultUnselected: [],
	_originalText:'',
	_className:"",
	_sharedData: new AnnotatorSharedData(),
	_loadingTime : 0,
	_lastStep : false,
	_openedPopupFigures : false,
	
	
	resetStatus: function(){
		this._annotationsData=[];
		this._annotationsMarked=[];
		this._annotationsHighlighted=[];
		this._annotationsCompletelyMarked=[];
		this._idAnnotationsMarked=[];
		this._indexStart= -1;
		this._annotationStartIndex= 0;
		this._timeElapsed= 0;
		this._indexStartElaboration = -1;
	},
	
	_getFixedAnnotationsStartup: function (){
		 return [Biojs.AnnotatorBase.ACCESSION_NUMBERS];
	},

	/**
	 * Array containing the supported event names
	 * @name Biojs.Citation-eventTypes
	 */
	eventTypes : [
  		/**
  		 * @name Biojs.Citation#onRequestError
  		 * @event Event raised when there's a problem during the citation data loading. An example could be that some mandatory parameters are missing, or no citation is identified by the specified parameters in the Europe PMC system.
  		 * @param {function} actionPerformed A function which receives an {@link Biojs.Event} object as argument.
  		 * @eventData {Object} source The component which did triggered the event.
  		 * @eventData {string} error Error message explaining the reason of the failure.
  		 * 
  		 * @example 
  		 * instance.onRequestError(
  		 *    function( e ) {
  		 *       alert ('Error during citation data retrieving:'+e.error);
  		 *    }
  		 * ); 
  		 * 
  		 * */
  		"onRequestError",
  		/**
  		 * @name Biojs.Citation#onCitationLoaded
  		 * @event  Event raised when the citation data loading process is successful
  		 * @param {function} actionPerformed A function which receives an {@link Biojs.Event} object as an argument.
  		 * 
  		 * @example 
  		 * instance.onCitationLoaded(
  		 *    function( e ) {
  		 *      alert ('Citation loaded successfully');
  		 *    }
  		 * ); 
  		 * 
  		 * */
  		"onAnnotationsLoaded",
  		"onTextChanged"
	],
	

	_getAnnotatorTypeLabel: function(){
		return "europepmc";
	},
	
	_getParamRequest: function(){
		var self=this;
		
		return {"pmcid": self.opt.pmcId,"type": self._getAnnotatorTypeLabel()};
		
	},
	
	load: function() {
		
		if ((this.opt.pmcId==undefined || this.opt.pmcId ==0)){
			 this.raiseEvent(Biojs.Annotator.EVT_ON_REQUEST_ERROR, {error:"pmcId parameter mandatory"});
		}else if (this.opt.target==undefined || this.opt.target ==''){
			 this.raiseEvent(Biojs.Annotator.EVT_ON_REQUEST_ERROR, {error:"target parameter mandatory"});
		}else{
		
			/**var urlRequest = ''+ this.opt.hostVirtuoso + this.opt.restRdfUrl;
			urlRequest = urlRequest.replace(new RegExp("{pmcid}", "g"),this.opt.pmcId);*/
			
			var self = this;
			var legendaContainer = jQuery('#'+self.opt.idLegend);
			
			if ((legendaContainer!== undefined) && (legendaContainer.html()=="") && (self.opt.loadingStatusImage !== undefined)) {
       			
       			legendaContainer.html('<div class="legend_annotation_loading"></div>');
       			var legendaContainerInside = jQuery('#'+self.opt.idLegend+' .legend_annotation_loading');
       			
       			//legendaContainerInside.html('<div class=\"annotation_visualization_loading_icon\"><i class=\"fa fa-spinner fa-spin fa-2x\"></i></div><div class=\"annotation_visualization_loading_label\">Loading annotations...</div>');
       			legendaContainerInside.html('<div class=\"annotation_visualization_loading_icon\"><img src=\"'+self.opt.loadingStatusImage+'\"/></div><div class=\"annotation_visualization_loading_label\">Loading annotations...</div>');

       			/**legendaContainerInside.css('width','32px');
       			legendaContainerInside.css('height','32px');
       			legendaContainerInside.css('margin-left','81px');
       			legendaContainerInside.css('margin-top','41px');
       			
       			legendaContainerInside.css( 'background-image', 'url(' + self.opt.loadingStatusImage + ')' );
       			legendaContainerInside.css( 'background-repeat', 'no-repeat' );*/
       			legendaContainer.show();
    		}
			
			this._loadingTime = new Date().getTime();
			
			 jQuery.ajax({
		            type: "GET",
		            url: self.opt.proxyUrl,
		            dataType: 'json',
		            encoding:"UTF-8",
		            contentType: "text/plain; charset=UTF-8",
		            data: self._getParamRequest(),
		            headers: {
		                Accept: "application/json",
		                "Access-Control-Allow-Origin": "*"
		            },
		            success: function(resp) {
		               if (resp.results.bindings!=undefined && resp.results.bindings.length>0){
		            	   
		            	   self._loadingTime = new Date().getTime() - self._loadingTime;
		            	   
		            	   self._annotationsData = resp.results.bindings;
		            	   
		            	   self._manipulateResponse();

		           		   self._annotationsData.sort(function(a, b){ 
		           			                      		return self._sortAnnotations(a,b);
		           			                      });
		           		   
			               self._highlightAnnotations();
		              }else{
		            	   self.raiseEvent(Biojs.Annotator.EVT_ON_REQUEST_ERROR, {error:"Impossible to find an annotation for the pmcId "+self.opt.pmcId});
		            	  
			               if (self.opt.loadingStatusImage !== undefined ) {
			            	   if (self._sharedData.getAnnotationFound().length==0 && self._lastStep==true){
			            		   var legendaContainer = jQuery('#'+self.opt.idLegend);
			            		   legendaContainer.html('');
			            	   }
			     				
			     		   }
			               
			               self._postHighlightDone();
		              }
		              
		            },
		            error: function(e) {
		            	self.raiseEvent(Biojs.Annotator.EVT_ON_REQUEST_ERROR, {error:"Generic error"});
		            	if (self.opt.loadingStatusImage !== undefined ) {
		            		 if (self._sharedData.getAnnotationFound().length==0 && self._lastStep==true){
		            			 var legendaContainer = jQuery('#'+self.opt.idLegend);
		    					 legendaContainer.html('');
		            		 }
		    			}
		            	
		            	self._postErrorDone();
		            }
		      });
			
			
		}
	},
	
	_manipulateResponse: function (){
		
	},
	
	_postHighlightDone: function(){
		
		this._hideLegend();
		
	},
	
	_hideLegend: function(){
		if (this.opt.idLegend!= undefined && this.opt.idLegend!='' && this._sharedData.getAnnotationFound().length==0){
			jQuery('#'+this.opt.idLegend).html('');
		}
	},
	
	_postErrorDone: function(){
		this._postHighlightDone();
	},
	
	_highlightAnnotations: function (){

		
		var startTime = new Date().getTime();

		var self = this;
		var type = "";
		var annotation;
		var originalText;
		
		
		originalText = this._getTextContainer();
		
		if (this._originalText==''){ 
			
			this._originalText = this._getTextContainer();
		}

		var indexStart = this._annotationStartIndex;
		
		
		var numberAnnotationProcessed=0;
		for (var i=indexStart; i<this._annotationsData.length; i++){ 
			annotation= this._annotationsData[i];
			type = this._getAnnotationType(annotation); 
			
			if (type!=null){
				if (this._sharedData.isAnnotationFound(type)==false){
					
					if (this._checkAnnotationDiscoverability(originalText, annotation)){ 
						this._sharedData.appendAnnotationFound({type: type, annotator: this, total:1});
					}
				}else{
					
					this._sharedData.incAnnotationFound(type);
					
				}
				
			}
			
			numberAnnotationProcessed = numberAnnotationProcessed + 1;
			if (((numberAnnotationProcessed == this.opt.splitSize)) || (i== (this._annotationsData.length -1))){
				this._annotationStartIndex = i + 1;
				break;
			}
		}
		
		this._setTextContainer(originalText);
		
		var endTime = new Date().getTime();
		this._timeElapsed = this._timeElapsed + (endTime - startTime);
		
		if (((this._annotationStartIndex == this._annotationsData.length)) ==false){
			setTimeout(function(){self._highlightAnnotations()}, self.opt.splitInterval);
		}else{
			if (this.opt.idLegend!= undefined && this.opt.idLegend!='' && (this._sharedData.getAnnotationFound().length>0) ){
				this._buildAgenda();
			}
			
			//self.raiseEvent(Biojs.Annotator.EVT_ON_ANNOTATIONS_LOADED, {});
			
			this._postHighlightDone();
			
		}
	},
	
	_addDataResult: function (startOffset, endOffset, annotation){
		
		var typeAnnotation= this._getAnnotationType(annotation);
		var annotationDataResult = {type: typeAnnotation, offset:{startIndex: startOffset, endIndex: endOffset}, annotationsConnected: [{data: annotation, annotator:this._className, offset:{startIndex: startOffset, endIndex: endOffset}}]};
		
		return this._sharedData.appendDataResult(annotationDataResult);
		//this._dataResult [this._dataResult.length] = annotationDataResult;
		
	},
	
	_mergeDataResult: function(checkSize, keepCurrentIndex){
		this._dataResult = this._sharedData.getDataResult();
		if ((this._dataResult.length > 0) || (checkSize==false)){
			 
			 this._dataResult.sort(function(a, b){ 
	          		if (a.offset.startIndex <= b.offset.startIndex){
	          			return -1;
	          		}else{
	          			return 1;
	          		}
	          });
			 
			 var k;
			 var dataResultMerged = [];
			 var sortedDataResult = null;
			 var j;
			 var self=this;
			 for (k=0; k<this._dataResult.length; k++){
				 if (sortedDataResult == null){
					 sortedDataResult = this._dataResult[k];
				 }else{
					 
					 if (this._dataResult[k].offset.startIndex > sortedDataResult.offset.endIndex){
						 //no overlap with next annotation
						 sortedDataResult.annotationsConnected.sort(function(a, b){ 
				          		if (self._getAnnotationTextGeneral(a.data, a.annotator).length >= self._getAnnotationTextGeneral(b.data, b.annotator).length){
				          			return -1;
				          		}else{
				          			return 1;
				          		}
				          });
						 sortedDataResult.type = this._getAnnotationTypeGeneral(sortedDataResult.annotationsConnected[0].data, sortedDataResult.annotationsConnected[0].annotator);
						 dataResultMerged[dataResultMerged.length] = sortedDataResult;
						 sortedDataResult = this._dataResult[k];
					 }else{
						 //overlap with previous annotation
						 for (j=0;j<this._dataResult[k].annotationsConnected.length;j++){
							 sortedDataResult.annotationsConnected[sortedDataResult.annotationsConnected.length] = this._dataResult[k].annotationsConnected[j];
						 }
						 
						 if (this._dataResult[k].offset.endIndex > sortedDataResult.offset.endIndex){
							 //need to update end index
							 sortedDataResult.offset.endIndex = this._dataResult[k].offset.endIndex;
						 }
						 
					 }
				 }
			 }
			 
			 if (sortedDataResult!=null){
				 //update last
				 sortedDataResult.annotationsConnected.sort(function(a, b){ 
		          		if (self._getAnnotationTextGeneral(a.data, a.annotator).length >= self._getAnnotationTextGeneral(b.data, b.annotator).length){
		          			return -1;
		          		}else{
		          			return 1;
		          		}
		          });
				 sortedDataResult.type = this._getAnnotationTypeGeneral(sortedDataResult.annotationsConnected[0].data, sortedDataResult.annotationsConnected[0].annotator);
				 dataResultMerged[dataResultMerged.length] = sortedDataResult;
			 }
			 
			 
			 this._dataResult = dataResultMerged;
			 this._dataResult.sort(function(a, b){ 
	       		if (a.offset.startIndex <= b.offset.startIndex){
	       			return -1;
	       		}else{
	       			return 1;
	       		}
	        });
			 
			 
			 
			 this._reHighlightAnnotations(this._dataResult, keepCurrentIndex);
			 
			 this._sharedData.setDataResult(this._dataResult);
		}
		 
	},
	
	_reHighlightAnnotations : function(dataResultMerged, keepCurrentIndex){
		
		var increasedOffset = 0;
		var k=0;
		var textArticle = this._originalText;
		var textAnnotation;
		var prefixHTML;
		var postfixHTML;
		var idAnnotation;
		var idAnnotationDialog;
		var style_class;
		var actionAnnotator= new Biojs.AnnotatorAction({});
		var currentAnnotationData;
		this._sharedData.incRehighlightIteration();
		var rehighlightIteration = this._sharedData.getRehighlightIteration();
		
		this._resetRegisterIdSingleAnnotation(keepCurrentIndex);
		
		for (k=0; k<dataResultMerged.length; k++){
			currentAnnotationData = dataResultMerged[k];
			style_class = this._getAnnotationStyle(currentAnnotationData.type);
			textAnnotation = textArticle.substring (currentAnnotationData.offset.startIndex + increasedOffset, currentAnnotationData.offset.endIndex + increasedOffset);
			
			prefixHTML = textArticle.substr(0, currentAnnotationData.offset.startIndex + increasedOffset);
			postfixHTML = textArticle.substr(currentAnnotationData.offset.startIndex + increasedOffset + textAnnotation.length);
			
			
			idAnnotation = "rdf_annotation_"+rehighlightIteration+"_"+k;
			idAnnotationDialog = idAnnotation+"_dialog";
			replacement = "<span id=\""+idAnnotation+"\" class=\""+style_class+"\">"+textAnnotation+"</span><span style=\"display:inline-block;width:0px;height:0px;\" class=\"annotation_dialog_container\" id=\""+idAnnotationDialog+"\"></span>";
			
			this._linkClickSingleAnnotation(actionAnnotator, idAnnotation, currentAnnotationData.annotationsConnected, idAnnotationDialog, k);
			
			this._registerIdSingleAnnotation(idAnnotation, currentAnnotationData.annotationsConnected);
			
			textArticle = prefixHTML + replacement+postfixHTML;
			
			increasedOffset = increasedOffset + (replacement.length - textAnnotation.length);
			
			//this._setTextContainer(textArticle);
		}
		
		this._setTextContainer(textArticle);
		
	},
	
	_linkClickSingleAnnotation : function(actionAnnotator, idAnnotation, annotationsConnected, idAnnotationDialog, k){
		var self=this;
		jQuery(document).off('click', '#'+idAnnotation);
		jQuery(document).on('click', '#'+idAnnotation ,function(pos){
			actionAnnotator.load(annotationsConnected, idAnnotationDialog, k, pos.clientX, pos.clientY, self.opt.pmcId, pos);
			
		});
		
	},
	
	_registerIdSingleAnnotation : function(idAnnotation, annotationsConnected){
		var typeAnn;
		for (var i = 0; i< annotationsConnected.length; i++){
			typeAnn = this._getAnnotationTypeGeneral(annotationsConnected[i].data, annotationsConnected[i].annotator);
			this._sharedData.registerIdAnnotationFound(idAnnotation, typeAnn);
		}
		
	},
	
    _resetRegisterIdSingleAnnotation : function(keepCurrentIndex){
    	this._sharedData.resetRegisterIdAnnotationFound(keepCurrentIndex);
	},
	
	_goToNextAnnotation : function(type){
		var labelLegend = this._getAnnotationLabel(type);
		var idNextAnnotation = this._sharedData.goToNextAnnotation(type, labelLegend);
		if (idNextAnnotation !=""){
			this._scrollToAnnotation(idNextAnnotation);
		}
		//this._manageUpDownIconsAgenda(type);
	},
	
	_goToPreviousAnnotation : function(type){
		var labelLegend = this._getAnnotationLabel(type);
		var idPreviousAnnotation = this._sharedData.goToPreviousAnnotation(type, labelLegend);
		if (idPreviousAnnotation !=""){
			this._scrollToAnnotation(idPreviousAnnotation);
		}
		//this._manageUpDownIconsAgenda(type);
	},
	
	_scrollToAnnotation: function (idAnnotation){
		var scrollPositionAnnotation = jQuery('#'+idAnnotation).offset().top;
		scrollPositionAnnotation = scrollPositionAnnotation - (jQuery(window).height()/2);
		jQuery(document).scrollTop(scrollPositionAnnotation);
	},
		
	_elaborateAnnotation: function(annotation, orderInfo){
	    	var textAnnotation = this._getAnnotationText(annotation);
	    	
			var prefixAnnnotation= this._elaboratePreFixAnnotation(this._getAnnotationPrefix(annotation));
			var postfixAnnotation= this._elaboratePostFixAnnotation(this._getAnnotationPostfix(annotation));
			var typeAnnotation=   this._getAnnotationType(annotation);
			
			var start=0;
			if (this._indexStartElaboration>0){
				start = this._indexStartElaboration;
			}

			var firstFinding = true;
	
			var resultSearch = this._findText(textAnnotation, this._originalText, start);
			
			indexFound = resultSearch.index;
			
			var prefixHTML,prefixPlain,postfixHTML,postfixPlain;
		
			while(indexFound >0){
				prefixHTML = this._originalText.substr(0, indexFound);
				prefixPlain = this._elaboratePreFixHtml(this._stripsHTMLTags(prefixHTML));
				postfixHTML = this._originalText.substr(indexFound + resultSearch.matchedText.length);
				postfixPlain = this._elaboratePostFixHtml(this._stripsHTMLTags(postfixHTML));
				
				if (this._isAnnotationMatching(prefixPlain, prefixAnnnotation, postfixPlain, postfixAnnotation)){
					
					if (firstFinding && (this._isToOptimize(orderInfo))){
						this._indexStartElaboration = indexFound;
						firstFinding = false;
					}
					
					
					if (this._addDataResult(indexFound, indexFound + resultSearch.matchedText.length, annotation)){
						this._sharedData.incAnnotationFound(typeAnnotation);
					}
					
					
					break;
					
					
				}
				
				start = indexFound + resultSearch.matchedText.length;
				resultSearch = this._findText(textAnnotation, this._originalText, start);
				indexFound = resultSearch.index;
			}
	},
	
	
	_highligthAnnotation: function(originalText, annotation, orderInfo){
		
	    var highligthedAnnotation= this._isAnnotationHighlighted(annotation);
	    var originalTextResult = originalText;
	    
	    if (highligthedAnnotation==false){ 
	    	var textAnnotation = this._getAnnotationTextSummary(annotation);
	    	var type = this._getAnnotationType(annotation);
	    	originalTextResult = this._highligthAnnotationDirectly(originalText, annotation, orderInfo, false);
			
			if (this._isAnnotationCompletelyMarked(type, textAnnotation)==false){
				this._annotationsCompletelyMarked[this._annotationsCompletelyMarked.length]= {"type": type, "exact": textAnnotation.toLowerCase()};
			}
		
	    }
		
		return originalTextResult;
	},
	
    _highligthAnnotationDirectly: function(originalText, annotation, orderInfo, fromContextualMenu){
		
    	    var self = this;
    	     
	    	var textAnnotation = this._getAnnotationText(annotation);
	    	var type= this._getAnnotationType(annotation);
			var style_class = this._getAnnotationStyle(type);
			
			var prefixAnnnotation= this._elaboratePreFixAnnotation(this._getAnnotationPrefix(annotation));
			var postfixAnnotation= this._elaboratePostFixAnnotation(this._getAnnotationPostfix(annotation));
			
			var start=0;
			if (this._indexStart>0){
				start = this._indexStart;
			}
			var replacement="";
			var idAnnotation;
			var idAnnotationDialog;
			var actionAnnotator= new Biojs.AnnotatorAction({});

			var firstFinding = true;
			
			var matchingAnnotation;
			var notDoubledAnnotation;
			var notMarkedAnnotation;
	
            var resultSearch = this._findText(textAnnotation, originalText, start);
			
			indexFound = resultSearch.index;
			
			while(indexFound >0){
				prefixHTML = originalText.substr(0, indexFound);
				prefixPlain = this._elaboratePreFixHtml(this._stripsHTMLTags(prefixHTML));
				postfixHTML = originalText.substr(indexFound + resultSearch.matchedText.length);
				postfixPlain = this._elaboratePostFixHtml(this._stripsHTMLTags(postfixHTML));
				
				matchingAnnotation = this._isAnnotationMatching(prefixPlain, prefixAnnnotation, postfixPlain, postfixAnnotation);
				notDoubledAnnotation = (this._isDoubledAnnotation(annotation, prefixHTML)==false);
				notMarkedAnnotation = (this._isIdAnnotationsMarked(orderInfo)==false);
				
				if ( matchingAnnotation && notMarkedAnnotation && notDoubledAnnotation){

					
					idAnnotation = "rdf_annotation_"+orderInfo;
					idAnnotationDialog = idAnnotation+"_dialog";
					replacement = "<span id=\""+idAnnotation+"\" class=\""+style_class+"\">"+resultSearch.matchedText+"</span><span style=\"display:inline-block;width:0px;height:0px;\" class=\"annotation_dialog_container\" id=\""+idAnnotationDialog+"\"></span>";
					
					this._linkClickSingleAnnotation(actionAnnotator, idAnnotation, [{data: annotation, annotator: self._className, offset:{startIndex: indexFound, endIndex: indexFound + resultSearch.matchedText.length}}], idAnnotationDialog, orderInfo);
					
					
					originalText = prefixHTML + replacement+postfixHTML;
					start = indexFound + replacement.length;
	                
					
					if (firstFinding && (this._isToOptimize(orderInfo))){
						this._indexStart = indexFound;
						firstFinding = false;
					}
					
					
					this._idAnnotationsMarked[this._idAnnotationsMarked.length]= orderInfo;
					
					
					break;
					
				}else{
	
					start = indexFound + textAnnotation.length;
					
					if (firstFinding && this._endsWith(prefixPlain, prefixAnnnotation) && this._startsWith(postfixPlain, postfixAnnotation) && (this._isIdAnnotationsMarked(orderInfo)==false) && (this._isToOptimize(orderInfo))){
						this._indexStart = indexFound;
						firstFinding = false;
						
					}
					
				}
				
				resultSearch = this._findText(textAnnotation, originalText, start);
				
				indexFound = resultSearch.index;
				
			}
			
			if (fromContextualMenu){
				var textAnnotationSummary = this._getAnnotationTextSummary(annotation);
				if (this._isAnnotationCompletelyMarked(type, textAnnotationSummary)==false){
					this._annotationsCompletelyMarked[this._annotationsCompletelyMarked.length]= {"type": type, "exact": textAnnotationSummary.toLowerCase()};

				}
				
			}
			
		   return originalText;
	},
	
	 _checkAnnotationDiscoverability: function(originalText, annotation){
 	     
    	var textAnnotation = this._getAnnotationText(annotation);
    	var type= this._getAnnotationType(annotation);
		var style_class = this._getAnnotationStyle(type);
		
		var prefixAnnnotation= this._elaboratePreFixAnnotation(this._getAnnotationPrefix(annotation));
		var postfixAnnotation= this._elaboratePostFixAnnotation(this._getAnnotationPostfix(annotation));

        var indexFound;
        var matchingAnnotation;
        var prefixHTML;
        var prefixPlain;
        var postfixHTML;
        var postfixPlain;

        var resultSearch = this._findText(textAnnotation, originalText, 0);
		
		indexFound = resultSearch.index;
		
		while(indexFound >0){
			prefixHTML = originalText.substr(0, indexFound);
			prefixPlain = this._elaboratePreFixHtml(this._stripsHTMLTags(prefixHTML));
			postfixHTML = originalText.substr(indexFound + resultSearch.matchedText.length);
			postfixPlain = this._elaboratePostFixHtml(this._stripsHTMLTags(postfixHTML));
			
			matchingAnnotation = this._isAnnotationMatching(prefixPlain, prefixAnnnotation, postfixPlain, postfixAnnotation);
			
			if ( matchingAnnotation){
				return true;
			}
			
			resultSearch = this._findText(textAnnotation, originalText, indexFound + resultSearch.matchedText.length);
			
			indexFound = resultSearch.index;
			
		}
		
	   return false;
	},
	
	_isAnnotationMatching: function(prefixPlain, prefixAnnnotation, postfixPlain, postfixAnnotation){
		var ret; 
		
		ret = this._endsWith(prefixPlain, prefixAnnnotation) && this._startsWith(postfixPlain, postfixAnnotation);
		
		return ret;
	},
	
	_sortAnnotations: function (a,b){
		var positionA = this._getAnnotationPosition(a);
		var indexFound = positionA.indexOf(".", 0);
		var sentenceAIndex = parseInt(positionA.substr(0, indexFound));
		var wordAIndex = parseInt(positionA.substr(indexFound + 1));
		
		var positionB = this._getAnnotationPosition(b);
		indexFound = positionB.indexOf(".", 0);
		var sentenceBIndex = parseInt(positionB.substr(0, indexFound));
		var wordBIndex = parseInt(positionB.substr(indexFound + 1));
		
		if (sentenceAIndex < sentenceBIndex){
			return -1;
		}else if (sentenceAIndex > sentenceBIndex){
			return 1;
		}else{
			if (wordAIndex < wordBIndex){
				return -1;
			}else{
				return 1;
			}
		}
		return -1;
	},
	
	highlightAnnotationFromContextualMenu: function (annotationData){
		var annotation;
		
		var typeAnnotation;
		var textAnnotation;
		var originalText = this._getTextContainer();
		var type = this._getAnnotationType(annotationData); 
		var text = this._getAnnotationTextSummary(annotationData);
		this._indexStart= -1;
		
		for (var i=0; i<this._annotationsData.length; i++){ 
			annotation= this._annotationsData[i];
			 typeAnnotation = this._getAnnotationType(annotation); 
			 textAnnotation = this._getAnnotationTextSummary(annotation);
			
			if (type==typeAnnotation && textAnnotation.toLowerCase()==text.toLowerCase()){ 
				originalText = this._highligthAnnotationDirectly(originalText, annotation, i, true);
			}
		}
		
		this._setTextContainer(originalText);
	},
	
	highlightOnlyFirstAnnotationFromContextualMenu: function (annotationData){
		this._indexStart= -1;
		var self=this;
		var annotation;
		
		var typeAnnotation;
		var textAnnotation;
		var originalText = this._getTextContainer();
		
		var type = this._getAnnotationType(annotationData); 
		var text = this._getAnnotationText(annotationData);
		var textSummary = this._getAnnotationTextSummary(annotationData);
		
		//deselect all the annotation of that type
		var style_class = this._getAnnotationStyle(type);
		
		originalText = originalText.replace(new RegExp("<span id=\"rdf_annotation_\\d{1,}\" class=\""+style_class+"\">"+text+"</span><span style=\"display:inline-block;width:0px;height:0px;\" class=\"annotation_dialog_container\" id=\"rdf_annotation_\\d{1,}_dialog\"></span>", "ig"), function extractAnnotation(x){ return self._extractAnnotation(annotationData, x);});
		
		originalText = originalText.replace(new RegExp("<span id=\"rdf_annotation_\\d{1,}\" class=\""+style_class+"\">"+text+"</span>", "ig"), function extractAnnotation(x){ return self._extractAnnotation(annotationData, x);});
		
		var originalTextBefore;
		
		//select only the first annotation again
		for (var i=0; i<this._annotationsData.length; i++){ 
			annotation= this._annotationsData[i];
			 typeAnnotation = this._getAnnotationType(annotation); 
			 textAnnotation = this._getAnnotationTextSummary(annotation);
			
			if (type==typeAnnotation && textAnnotation.toLowerCase()==textSummary.toLowerCase()){
				this._removeIdAnnotationsMarked(i);
				originalTextBefore = originalText;
				originalText = this._highligthAnnotationDirectly(originalText, annotation, i, true);
				if (originalTextBefore != originalText){
					this._removeAnnotationCompletelyMarked(typeAnnotation, textAnnotation);
					break;
				}
			}
		}
		
		this._setTextContainer(originalText);
	},
	
	_extractAnnotation : function(annotationData, textAnnotated){
		var type = this._getAnnotationType(annotationData); 
		
		//deselect all the annotation of that type
		var style_class = this._getAnnotationStyle(type);
		
		textAnnotated = textAnnotated.replace(new RegExp("<span id=\"rdf_annotation_\\d{1,}\" class=\""+style_class+"\">", "ig"), "");
		textAnnotated = textAnnotated.replace(new RegExp("</span>", "ig"), "");
		textAnnotated = textAnnotated.replace(new RegExp("<span style=\"display:inline-block;width:0px;height:0px;\" class=\"annotation_dialog_container\" id=\"rdf_annotation_\\d{1,}_dialog\">", "ig"), "");
		return textAnnotated;
		
	},
	
	_isToOptimize: function (orderInfo){
		var ret=true;
		
		var text = this._getAnnotationTextSummary(this._annotationsData[orderInfo]);
		
		var textAnnotation;
		if (this._annotationsData.length > (orderInfo + 1)){
			for (var i=orderInfo + 1; i<this._annotationsData.length; i++){ 
				textAnnotation = this._getAnnotationTextSummary(this._annotationsData[i]);
				if (textAnnotation.toLowerCase()==text.toLowerCase()){ 
						ret= false;
				}
			
			}
		}
			
		
		return ret;
	},
	
	_isDoubledAnnotation : function(annotationData, prefixHTML){
		var type = this._getAnnotationType(annotationData); 
		
		//deselect all the annotation of that type
		var style_class = this._getAnnotationStyle(type);
		
		ret = this._endsWith(prefixHTML,"class=\""+style_class+"\">");
		
		return ret;
		
	},
	
	_isIdAnnotationsMarked: function (orderInfo){
		
		if (this._idAnnotationsMarked.length==0){
			return false;
		}else{
			for (var i=0;i<this._idAnnotationsMarked.length; i++){
				if (this._idAnnotationsMarked[i]==orderInfo){
					return true;
				}
			}
		}
		
		return false;
	},
	
	_removeIdAnnotationsMarked: function (orderInfo){
		var indextoRemove= -1;
		for (var i=0;i<this._idAnnotationsMarked.length; i++){
			if (this._idAnnotationsMarked[i]==orderInfo){
				indextoRemove = i;
				break;
			}
		}
		
		if (indextoRemove>=0){ 
			this._idAnnotationsMarked.splice( indextoRemove, 1 );
		}
	}
	
    _isAnnotationHighlighted: function (annotation){
		var ret=false;
		return ret;
	},
	
   _isAnnotationMarked: function (type){
		
		if (this._annotationsMarked.length==0){
			return false;
		}else{
			for (var i=0;i<this._annotationsMarked.length; i++){
				if (this._annotationsMarked[i]==type){
					return true;
				}
			}
		}
		
		return false;
	},
	
    _isAnnotationCompletelyMarked: function (type, textAnnotation){
    	var ret= false;
		if (this._annotationsCompletelyMarked.length ==0){
			ret=false;
		}else{
			for (var i=0;i<this._annotationsCompletelyMarked.length; i++){
				if ((this._annotationsCompletelyMarked[i].type==type) && (this._annotationsCompletelyMarked[i].exact.toLowerCase()==textAnnotation.toLowerCase())){
					ret=true;
					break;
				}
			}
		}
		
		return ret;
	},
	
	
	_removeAnnotationCompletelyMarked: function (type, textAnnotation){
		var indextoRemove= -1;
		for (var i=0;i<this._annotationsCompletelyMarked.length; i++){
			if ((this._annotationsCompletelyMarked[i].type==type) && (this._annotationsCompletelyMarked[i].exact.toLowerCase()==textAnnotation.toLowerCase())){
				indextoRemove = i;
				break;
			}
		}
		
		if (indextoRemove>=0){ 
			this._annotationsCompletelyMarked.splice( indextoRemove, 1 );
			
		}
	},
	
	
	_elaboratePreFixAnnotation: function (prefix){
		
		return prefix;
    	
	},
	
	_elaboratePostFixAnnotation: function (postfix){
		
		if (this._endsWith(postfix, " ")){
			postfix = postfix.substr(0, postfix.length-1);
		}
		
    	return postfix;
    	
	},
	
    _elaboratePreFixHtml: function (prefix){
    	return prefix;
    	
	},
	
	_elaboratePostFixHtml: function (postfix){
    	return postfix;
	},
	
	_stripsHTMLTags:function(inputHTML){
		return inputHTML.replace(/(<([^>]+)>)/ig,"");
	},
	
	_buildAgenda: function(){
		if (this._sharedData.getAnnotationFound().length>0){
			var self = this;
			
			var legendaContainer = jQuery('#'+self.opt.idLegend);
			//legendaContainer.html('');
			
			var entityHelp = 'articles';
			
			var helpText = 'SciLite annotations in Europe PMC are text mined, biological terms and concepts which can be highlighted in the text of '+entityHelp+'. To show annotations on the text, tick the relevant checkbox in the panel below.'+
			                '<ul>'+
			                 '<li>Gene Ontology terms are part of a controlled vocabulary of properties relating to genes and gene products, including RNA and proteins.</li>'+
			                 '<li>Gene function (also known as a GeneRIF) describes the function of a gene.</li>'+
			                 '</ul>';
			
			//legendaContainer.append('<div class="legenda_annotation_header"><div class="legenda_annotation_header_title">'+self._legendTitle+'</div><div id="legenda_annotation_header_help" class="legenda_annotation_header_help" onmouseover="TipAllowed(\''+helpText+'\');" onmouseout="UnTipAllowed();"><img src="/images/qmark.png"/></div></div>');
			 
			var htmlLegend='<div class="legenda_annotation_header"><div class="legenda_annotation_header_title">Show annotations in this article </div><div id="legenda_annotation_header_help" class="legenda_annotation_header_help" onmouseover="TipAllowed(\''+helpText+'\');" onmouseout="UnTipAllowed();"><img src="/images/qmark.png"/></div></div>';

			
			var legendaElementHTML;
			
			var type;
			
			var styleclass;
			var checkboxId;
			var labelLegendId;
			var upIconId;
			var downIconId;
			var upDownIconVisibility;
			var checkBoxContainerId;
			var legendaElementCountId;
			var checkedValueCheckbox;
			var typesAlreadChecked=[];
			var currentIndexesAlreadChecked=[];
			
			this._sharedData.getAnnotationFound().sort(function (a,b){
				if (self._getAnnotationLabel(a.type).toLowerCase() <= self._getAnnotationLabel(b.type).toLowerCase()){
					return -1;
				}else{
					return 1;
				}
			});
			
			for (var i=0; i<this._sharedData.getAnnotationFound().length; i++){ 
				
				type=this._sharedData.getAnnotationFound()[i].type;
				checkboxId='checkbox_annotation_'+type;
				labelLegendId='label_legend_annotation_'+type;
				checkBoxContainerId='checkbox_container_annotation_'+type;
				legendaElementCountId='legenda_element_count_'+type;
				legendaElementId='legenda_element_'+type;
				upIconId="legend_up_"+type;
				downIconId="legend_down_"+type;
				
				if ((jQuery('#'+legendaElementId)!=undefined) && (jQuery('#'+legendaElementId).length>0)){ 
					legendaElementHTML= '<div id="'+legendaElementId+'" class="legenda_element">' +jQuery('#'+legendaElementId).html()+'</div>';
					
					if ( (jQuery('#'+checkboxId).prop("checked")==true) || (jQuery('#'+checkboxId).attr('checked')=="checked")){
						typesAlreadChecked[typesAlreadChecked.length] = type;
						currentIndexesAlreadChecked[currentIndexesAlreadChecked.length] = this._sharedData.getCurrentIndex(type);
					}
				}else{	
					
					styleclass = self._getAnnotationStyle(type);
					
					legendaElementHTML='<div id="'+legendaElementId+'" class="legenda_element">';
					
					upDownIconVisibility="display:none";
					legendaElementHTML+='<div id='+checkBoxContainerId+' class="legenda_element_checkbox"><input name="'+type+'" type="checkbox" id="'+checkboxId+'"/></div><div id="'+labelLegendId+'" class="legenda_element_label">';
				
					
					legendaElementHTML+= ' '+self._getAnnotationLabel(type)+'</div>';
					
					
					legendaElementHTML+= '<div style="display:none" class="legend_up_down_icon" id="'+upIconId+'"><span class="fa fa-chevron-up fa-2"></span></div>';
					legendaElementHTML+= '<div style="display:none" class="legend_up_down_icon" id="'+downIconId+'"><span class="fa fa-chevron-down fa-2"></span></div>';
					legendaElementHTML+= '<div style="'+upDownIconVisibility+'" class="legend_up_down_icon_invisible" id="'+downIconId+'">...</div>';
					legendaElementHTML+= '';
					
					legendaElementHTML+="</div>";
				}
				
				//legendaContainer.append(legendaElementHTML);
				htmlLegend = htmlLegend+legendaElementHTML;
				
			}
			
			legendaContainer.attr('class','legenda_annotation');
			legendaContainer.html(htmlLegend);
			
			for (var i=0; i<this._sharedData.getAnnotationFound().length; i++){ 
				
				type=this._sharedData.getAnnotationFound()[i].type;
				checkboxId='checkbox_annotation_'+type;
				labelLegendId='label_legend_annotation_'+type;
				checkBoxContainerId='checkbox_container_annotation_'+type;
				legendaElementCountId='legenda_element_count_'+type;
				legendaElementId='legenda_element_'+type;
				upIconId="legend_up_"+type;
				downIconId="legend_down_"+type;
				
				this._linkClickAgenda(checkboxId, labelLegendId, upIconId, downIconId, legendaElementCountId, this._sharedData.getAnnotationFound()[i].annotator, type, legendaElementId);
				
				for (var k=0; k<typesAlreadChecked.length; k++){
					if (typesAlreadChecked[k]==type){
						
						 jQuery('#'+checkboxId).attr('checked', 'checked');
						 this._manageUpDownIconsAgenda(type);
						 this._sharedData.setCurrentIndex(type, currentIndexesAlreadChecked[k]);
					}
				}
			}
			
			
			PiwikAnalyticsTracker.tracking();
		}
	},
	
	_clickAllType: function(showAll){
		if (this._sharedData.getAnnotationFound().length>0){
			var type;
			var checkboxId;
			for (var i=0; i<this._sharedData.getAnnotationFound().length; i++){ 
				type=this._sharedData.getAnnotationFound()[i].type;
				checkboxId='checkbox_annotation_'+type;
				if (showAll){
					if ((jQuery('#'+checkboxId).attr('checked')!='checked') || (jQuery('#'+checkboxId).prop("checked")==false)){
						//jQuery('#'+checkboxId).attr('checked','checked');
						this._sharedData.getAnnotationFound()[i].annotator.selectAnnotationType(type, true, i);
						break;
					}
				}else{
					if ((jQuery('#'+checkboxId).attr('checked')=='checked') || (jQuery('#'+checkboxId).prop("checked")==true)){
						
						jQuery('#'+checkboxId).removeAttr('checked');
						
						this._sharedData.getAnnotationFound()[i].annotator.unselectAnnotationType(type);
					}
				}
				
			}
		}
	},
	
	_linkClickAgenda: function(checkboxId, labelLegendId, upIconId, downIconId, legendaElementCountId, self, type, legendaElementId){
		
		jQuery('#'+checkboxId).off('click');
		jQuery('#'+checkboxId).on('click', function(){
			
			if ((jQuery(this).attr('checked')=='checked') || (jQuery(this).prop("checked")==true)){
				self.selectAnnotationType(jQuery(this).attr('name'), false, 0);
				//jQuery('#'+upIconId).css('display','block');
				//jQuery('#'+downIconId).css('display','block');
				
			}else{
				self.unselectAnnotationType(jQuery(this).attr('name'));
				jQuery('#'+upIconId).css('display','none');
				jQuery('#'+downIconId).css('display','none');
				//jQuery('#'+legendaElementCountId).html('');
			}
			
		});
		
		jQuery('#'+labelLegendId).off('click');
		jQuery('#'+labelLegendId).on('click', function(){
			if ((jQuery('#'+checkboxId).attr('checked')!='checked') || (jQuery('#'+checkboxId).prop("checked")==false)){
				self.selectAnnotationType(type, false, 0);
				
				jQuery('#'+checkboxId).attr('checked','checked');
				
			}else{
				self.unselectAnnotationType(type);
				
				jQuery('#'+checkboxId).removeAttr('checked');
				
				jQuery('#'+upIconId).css('display','none');
				jQuery('#'+downIconId).css('display','none');
				
			}
		});
		
		jQuery('#'+upIconId).off('click');
		jQuery('#'+upIconId).on('click', function(){
			self._goToPreviousAnnotation(type);	
		});
		
		jQuery('#'+downIconId).off('click');
		jQuery('#'+downIconId).on('click', function(){
			self._goToNextAnnotation(type);	
			
		});
	},
	
	_manageUpDownIconsAgenda: function(type){
		var self=this;
		var annotationTypeInfo = this._sharedData.getAnnotationFoundType(type);
		var checkboxId='checkbox_annotation_'+type;
		var labelLegendId='label_legend_annotation_'+type;
		var upIconId="legend_up_"+type;
		var downIconId="legend_down_"+type;
		var checkBoxContainerId='checkbox_container_annotation_'+type;
		//var legendaElementCountId='legenda_element_count_'+type;
		var legendaElementId='legenda_element_'+type;
		if (annotationTypeInfo.total==0){
			jQuery("#"+labelLegendId).attr("class", "disabled_legend_element");
			jQuery("#"+labelLegendId).off("click");
			jQuery("#"+upIconId).css("display","none");
			jQuery("#"+downIconId).css("display","none");
			jQuery('#'+upIconId).off('click');
			jQuery('#'+downIconId).off('click');
			jQuery('#'+upIconId).addClass("legend_up_down_icon_disabled");
			jQuery('#'+upIconId).removeClass("legend_up_down_icon");
			jQuery('#'+downIconId).addClass("legend_up_down_icon_disabled");
			jQuery('#'+downIconId).removeClass("legend_up_down_icon");
			/**jQuery("#"+checkboxId).attr("disabled","true");
			jQuery("#"+checkboxId).removeAttr("checked");*/
			jQuery("#"+checkboxId).css("display","none");
			jQuery("#"+checkBoxContainerId).addClass("checkbox_legend_disabled");
			//jQuery('#'+legendaElementCountId).html('');
			jQuery("#"+legendaElementId).addClass("legend_element_zero"); 
			jQuery("#"+legendaElementId+ " .legend_up_down_icon_invisible").css("display","none");
		}else {
			
			/**if (annotationTypeInfo.currentIndex < 1){
				jQuery('#'+upIconId).off('click');
				jQuery('#'+upIconId).addClass("legend_up_down_icon_disabled");
				jQuery('#'+upIconId).removeClass("legend_up_down_icon");
				jQuery('#'+downIconId).off('click');
				jQuery('#'+downIconId).on('click', function(){
					self._goToNextAnnotation(type);	
				});
				jQuery('#'+downIconId).addClass("legend_up_down_icon");
				jQuery('#'+downIconId).removeClass("legend_up_down_icon_disabled");
			}else if(annotationTypeInfo.currentIndex == (annotationTypeInfo.total - 1)){
				jQuery('#'+downIconId).off('click');
				jQuery('#'+downIconId).addClass("legend_up_down_icon_disabled");
				jQuery('#'+downIconId).removeClass("legend_up_down_icon");
				jQuery('#'+upIconId).off('click');
				jQuery('#'+upIconId).on('click', function(){
					self._goToPreviousAnnotation(type);	
				});
				jQuery('#'+upIconId).addClass("legend_up_down_icon");
				jQuery('#'+upIconId).removeClass("legend_up_down_icon_disabled");
			}else{
				jQuery('#'+downIconId).off('click');
				jQuery('#'+downIconId).on('click', function(){
					self._goToNextAnnotation(type);	
				});
				jQuery('#'+downIconId).addClass("legend_up_down_icon");
				jQuery('#'+downIconId).removeClass("legend_up_down_icon_disabled");
				jQuery('#'+upIconId).off('click');
				jQuery('#'+upIconId).on('click', function(){
					self._goToPreviousAnnotation(type);	
				});
				jQuery('#'+upIconId).addClass("legend_up_down_icon");
				jQuery('#'+upIconId).removeClass("legend_up_down_icon_disabled");
			}*/
			
			/**
			jQuery("#"+upIconId).css("display","block");
			jQuery("#"+downIconId).css("display","block");
			jQuery('#'+downIconId).off('click');
			jQuery('#'+downIconId).on('click', function(){
				self._goToNextAnnotation(type);	
			});
			jQuery('#'+downIconId).addClass("legend_up_down_icon");
			jQuery('#'+downIconId).removeClass("legend_up_down_icon_disabled");
			jQuery('#'+upIconId).off('click');
			jQuery('#'+upIconId).on('click', function(){
				self._goToPreviousAnnotation(type);	
			});
			jQuery('#'+upIconId).addClass("legend_up_down_icon");
			jQuery('#'+upIconId).removeClass("legend_up_down_icon_disabled");*/
			
			jQuery("#"+legendaElementId+ " .legend_up_down_icon").css("display","block");
			jQuery("#"+legendaElementId+ " .legend_up_down_icon_invisible").css("display","none");
			
			jQuery('#'+legendaElementId).off('mouseenter');
			jQuery('#'+legendaElementId).on('mouseenter', function(){
				if ((jQuery('#'+checkboxId).attr('checked')=='checked') || (jQuery('#'+checkboxId).prop("checked")==true)){
					jQuery('#'+legendaElementId+' .legend_up_down_icon_invisible').css("display","none");
					jQuery('#'+legendaElementId+' .legend_up_down_icon').css("display","block");
				}else{
					jQuery('#'+legendaElementId+' .legend_up_down_icon_invisible').css("display","none");
					jQuery('#'+legendaElementId+' .legend_up_down_icon').css("display","none");
				}
			});
			
			jQuery('#'+legendaElementId).off('mouseleave');
			jQuery('#'+legendaElementId).on('mouseleave', function(){
				if ((jQuery('#'+checkboxId).attr('checked')=='checked') || (jQuery('#'+checkboxId).prop("checked")==true)){
					if (self._endsWith(jQuery('#'+labelLegendId).html(),'(0)')==false){
						jQuery('#'+legendaElementId+' .legend_up_down_icon_invisible').css("display","block");
					}
					jQuery('#'+legendaElementId+' .legend_up_down_icon').css("display","none");
				}else{
					jQuery('#'+legendaElementId+' .legend_up_down_icon_invisible').css("display","none");
					jQuery('#'+legendaElementId+' .legend_up_down_icon').css("display","none");
				}
			});
		}
	},
	
	unselectAnnotationType: function (type){
	
		var newDataResult = [];
		
		var k=0;
		var j=0;
		var i=0;
		var changedAnnotation = false;
		var newAnnotationsConnected = [];
		var annotationsRemoved = [];
		var sortedDataResult;
		var alreadyUnselected=false;
		var unSelectedAnalyzed=false;
		
		for (j=0; j<this._dataResultUnselected.length; j++){
			if (this._dataResultUnselected[j].type == type){ 
				unSelectedAnalyzed=true;
				break;
			}
		}
		
		this._dataResult = this._sharedData.getDataResult();
		
		for (k=0; k<this._dataResult.length; k++){
			 changedAnnotation = false;
			 newAnnotationsConnected = [];
			 annotationsRemoved = [];
			 
			 for (j=0;j<this._dataResult[k].annotationsConnected.length;j++){
				 if (this._getAnnotationTypeGeneral(this._dataResult[k].annotationsConnected[j].data, this._dataResult[k].annotationsConnected[j].annotator) == type){
					 changedAnnotation = true;
					 annotationsRemoved[annotationsRemoved.length] = {type: this._getAnnotationTypeGeneral(this._dataResult[k].annotationsConnected[j].data, this._dataResult[k].annotationsConnected[j].annotator), offset:{startIndex: this._dataResult[k].annotationsConnected[j].offset.startIndex, endIndex: this._dataResult[k].annotationsConnected[j].offset.endIndex}, annotationsConnected: [this._dataResult[k].annotationsConnected[j]]};
					 
				 }else{
					 newAnnotationsConnected[newAnnotationsConnected.length] = {type: this._getAnnotationTypeGeneral(this._dataResult[k].annotationsConnected[j].data, this._dataResult[k].annotationsConnected[j].annotator), offset:{startIndex: this._dataResult[k].annotationsConnected[j].offset.startIndex, endIndex: this._dataResult[k].annotationsConnected[j].offset.endIndex}, annotationsConnected: [this._dataResult[k].annotationsConnected[j]]};
				 }
			 }	
			 
			 if (changedAnnotation){
				 for (j=0; j<newAnnotationsConnected.length; j++){
					 newDataResult[newDataResult.length] = newAnnotationsConnected[j]
				  }
				 
				 alreadyUnselected=false;
				 
				 if (unSelectedAnalyzed == false){ 
					 for (j=0; j<this._dataResultUnselected.length; j++){
						if (this._dataResultUnselected[j].type == type){ 
							
							for (i=0;i<annotationsRemoved.length;i++ ){
								this._dataResultUnselected[j].data.push(annotationsRemoved[i]);
						    }
							alreadyUnselected=true;
							break;
						}
					}
					 
					 if (alreadyUnselected==false){
						 this._dataResultUnselected[this._dataResultUnselected.length]={type: type, data:annotationsRemoved};
					 }
				 }
				 
			 }else{
				 newDataResult[newDataResult.length] = this._dataResult[k];
			 }	
		 }
		
		 this._dataResult = newDataResult;
		 this._sharedData.setDataResult(this._dataResult);
		 this._mergeDataResult(false, true);
		 this._sharedData.setCurrentIndex(type, -1);
		 
		 var labelLegendId='label_legend_annotation_'+type;
		 var labelLegend= ' '+this._getAnnotationLabel(type);
		 jQuery('#'+labelLegendId).html(labelLegend);
		 
		var styleType = this._getAnnotationStyle(type);
		if (jQuery('#'+labelLegendId).hasClass(styleType)){
			jQuery('#'+labelLegendId).removeClass(styleType);
		}
		
	},
	
	selectAnnotationType: function (type, totalHighlight, indexType){
		
		var originalText = this._getTextContainer();
		if (this._isAnnotationMarked(type)){
		
			var i=0;
			var k=0;
			for (i=0; i<this._dataResultUnselected.length; i++){
				if (this._dataResultUnselected[i].type == type){ 
					for (k=0; k<this._dataResultUnselected[i].data.length;k++){
						this._sharedData.appendDataResult( this._dataResultUnselected[i].data[k]);
					}
					break;
				}
			}
			
			this._mergeDataResult(false, true);
			this._manageUpDownIconsAgenda(type);
			
			var labelLegendId='label_legend_annotation_'+type;
			var labelLegend= ' '+this._getAnnotationLabel(type)+' ('+this._sharedData.getAnnotationFoundTotal(type)+')';
			jQuery('#'+labelLegendId).html(labelLegend);
			
			var styleType = this._getAnnotationStyle(type);
			if (jQuery('#'+labelLegendId).hasClass(styleType)==false){
				jQuery('#'+labelLegendId).addClass(styleType);
			}
			
			
			if (totalHighlight){
		         var checkboxId='checkbox_annotation_'+type;
		        
		         jQuery('#'+checkboxId).attr('checked','checked');
		        
			     var nextIndexType = this._getNextAnnotationTypeToSelect(indexType);
			     if (nextIndexType > 0){
				        var nextType =  this._sharedData.getAnnotationFound()[nextIndexType].type;
				    	this._sharedData.getAnnotationFound()[nextIndexType].annotator.selectAnnotationType(nextType, true, nextIndexType);
				 }
		    }
		}else{
			
			var labelLegendId='label_legend_annotation_'+type;
			var labelLegend= ' '+this._getAnnotationLabel(type)+' <i class=\"fa fa-cog fa-spin fa-1x\"></i>';
			jQuery('#'+labelLegendId).html(labelLegend);
			
			this._indexStartElaboration= -1;
			
			this._indexStart= -1;
			
			this._annotationStartIndex = 0;
			
			this._timeElapsed = 0;
			
			//this.opt.splitInterval = 1000;
			
			this._sharedData.resetAnnotationFoundTotal(type);
			
			this._highlightAnnotationsSelect(type, totalHighlight, indexType);
			
		}
		
		
	},
	
	_getNextAnnotationTypeToSelect: function(indexType){
		var ret = -1;
		for (var i=indexType+1;i<this._sharedData.getAnnotationFound().length;i++){
			var checkboxId='checkbox_annotation_'+this._sharedData.getAnnotationFound()[i].type;
			if ((jQuery('#'+checkboxId).attr('checked')!='checked') || (jQuery('#'+checkboxId).prop("checked")==false)){
				ret = i;
				break;
			}
		}
		 
	    return ret;
	},
	
    _highlightAnnotationsSelect: function (inputType, totalHighlight, indexType){
		
		var startTime = new Date().getTime();

		var self = this;
		var type = "";
		var annotation;
		var originalText;
		
		
		originalText = this._getTextContainer();

		var indexStart = this._annotationStartIndex;
		
		
		var numberAnnotationProcessed=0;
		for (var i=indexStart; i<this._annotationsData.length; i++){ 
			annotation= this._annotationsData[i];
			type = this._getAnnotationType(annotation); 
			
			if (type==inputType){ 
				
			   originalText = this._highligthAnnotation(originalText, annotation, i);
					
			   this._elaborateAnnotation(annotation, i);
			   
			}
			
			numberAnnotationProcessed = numberAnnotationProcessed + 1;
			if (((numberAnnotationProcessed == this.opt.splitSize)) || (i== (this._annotationsData.length -1))){
				this._annotationStartIndex = i + 1;
				break;
			}
		}
		
		this._setTextContainer(originalText);
		
		var endTime = new Date().getTime();
		this._timeElapsed = this._timeElapsed + (endTime - startTime);
		
		if (((this._annotationStartIndex == this._annotationsData.length)) ==false){
			setTimeout(function(){self._highlightAnnotationsSelect(inputType, totalHighlight, indexType)}, self.opt.splitInterval/this._sharedData.getAnnotationFound().length);
		}else{
			 
		    
		    if (totalHighlight){
		         var checkboxId='checkbox_annotation_'+inputType;
		        
		        jQuery('#'+checkboxId).attr('checked','checked');
		         
			     
			     var nextIndexType = this._getNextAnnotationTypeToSelect(indexType);
			     if (nextIndexType > 0){ 
				     var nextType =  this._sharedData.getAnnotationFound()[nextIndexType].type;
				     this._sharedData.getAnnotationFound()[nextIndexType].annotator.selectAnnotationType(nextType, true, nextIndexType);
			     }
		    	
		    }else{
			
			    	this._mergeDataResult(false, true);
			}
			
			this._annotationsMarked[this._annotationsMarked.length]=inputType;
			
			var labelLegendId='label_legend_annotation_'+inputType;
			var labelLegend= ' '+self._getAnnotationLabel(inputType)+' ('+self._sharedData.getAnnotationFoundTotal(inputType)+')';
			jQuery('#'+labelLegendId).html(labelLegend);
			
			var styleType = this._getAnnotationStyle(inputType);
			if (jQuery('#'+labelLegendId).hasClass(styleType)==false){
				jQuery('#'+labelLegendId).addClass(styleType);
			}
			
			this._manageUpDownIconsAgenda(inputType);
		}
	},
	
	_setTextContainer: function(htmlText){
		jQuery('#'+this.opt.target).html(htmlText);
		this._callBackJSFunctionality();
	},
	
	_getTextContainer: function(){
		return jQuery('#'+this.opt.target).html();
	},
	
	_getAnnotationTextSummary: function(annotation){
		return this._getAnnotationText(annotation);
	},
	
	_getAnnotationType: function (annotation){
		var tagValue= this._getAnnotationBody(annotation);
		var type_ret=null;
		if (this._startsWith(tagValue, "http://purl.uniprot.org/uniprot/")){
			type_ret = Biojs.AnnotatorBase.GENES_PROTEINS;
		}else if (this._startsWith(tagValue, "http://identifiers.org/taxonomy/")){
			type_ret = Biojs.AnnotatorBase.ORGANISMS;
		}else if (this._startsWith(tagValue, "http://purl.obolibrary.org/obo/CHEBI_")){
			type_ret = Biojs.AnnotatorBase.CHEMICALS;
		}else if (this._startsWith(tagValue, "http://purl.obolibrary.org/obo/GO:") || this._startsWith(tagValue, "http://identifiers.org/go/GO:")){
			type_ret = Biojs.AnnotatorBase.GO_TERMS;
		}else if (this._startsWith(tagValue, "http://linkedlifedata.com/resource/umls-concept/")){
			type_ret = Biojs.AnnotatorBase.DISEASE;
		}else if (this._startsWith(tagValue, "http://www.ebi.ac.uk/efo/")){
			type_ret = Biojs.AnnotatorBase.EFO;
		}else if (this._startsWith(tagValue, "http://identifiers.org/")){
			type_ret = Biojs.AnnotatorBase.ACCESSION_NUMBERS;
		}
		
		return  type_ret;
	},
	
	_getAnnotationText: function (annotation){
		return annotation.exact.value;
	},
	
	_getAnnotationPosition: function (annotation){
		return annotation.position.value;
	},
	
	_getAnnotationSection: function (annotation){
		return annotation.section.value;
	},

	_getAnnotationUrl: function (annotation){
		var type= this._getAnnotationType(annotation);
		if (type==Biojs.AnnotatorBase.GENES_PROTEINS){
			return 'http://www.uniprot.org/uniprot/?query=name:\"'+this._getAnnotationText(annotation)+'\"';
		}else{ 
			
			var annotationUrl = this._getAnnotationBody(annotation);
			return annotationUrl;
		}
	},
	
	_getAnnotationPrefix: function (annotation){
		return annotation.prefix.value;
	},
	
	_getAnnotationUri: function (annotationData){
		return annotationData.annotation.value;
	},
	
	_getAnnotationBody: function (annotationData){
		var annotationBody;
		if (annotationData.tag!=undefined && annotationData.tag!=null){
			annotationBody = annotationData.tag.value;
		}else{
			annotationBody = annotationData.tags[0].uri;
		}
		
		return annotationBody;
	},
	
	_getAnnotationPostfix: function (annotation){
		return annotation.postfix.value;
	},
	
	_getAnnotationStyle: function (type){
		var style_class="";
		if (type==Biojs.AnnotatorBase.ACCESSION_NUMBERS){
			style_class="accession_numbers_annotation";
		}else if (type==Biojs.AnnotatorBase.GENES_PROTEINS){
			style_class="genes_proteins_annotation";
		}else if (type==Biojs.AnnotatorBase.ORGANISMS){
			style_class="organisms_annotation";
		}else if (type==Biojs.AnnotatorBase.CHEMICALS){
			style_class="chemicals_annotation";
		}else if (type==Biojs.AnnotatorBase.GO_TERMS){
			style_class="go_terms_annotation";
		}else if (type==Biojs.AnnotatorBase.DISEASE){
			style_class="disease_annotation";
		}else if (type==Biojs.AnnotatorBase.EFO){
			style_class="efo_annotation";
		}else if (type==Biojs.AnnotatorBase.PHOSPHORYLATE_NACTEM){
			style_class="phosphorylate_annotation";
		}else if (type==Biojs.AnnotatorBase.GENE_REF){
			style_class="generef_annotation";
		}else if (type==Biojs.AnnotatorBase.OPEN_TARGET){
			style_class="opentarget_annotation";
		}else if (type==Biojs.AnnotatorBase.DISGENET){
			style_class="disgenet_annotation";
		}else if (type==Biojs.AnnotatorBase.NCBI){
			style_class="ncbi_annotation";
		}
		
		return style_class;
	},
	
	_getAnnotationLabel: function (type){
		var label="";
		if (type==Biojs.AnnotatorBase.ACCESSION_NUMBERS){
			label="Accession Numbers";
		}else if (type==Biojs.AnnotatorBase.GENES_PROTEINS){
			label="Genes/Proteins";
		}else if (type==Biojs.AnnotatorBase.ORGANISMS){
			label="Organisms";
		}else if (type==Biojs.AnnotatorBase.CHEMICALS){
			label="Chemicals";
		}else if (type==Biojs.AnnotatorBase.GO_TERMS){
			label="Gene Ontology";
		}else if (type==Biojs.AnnotatorBase.DISEASE){
			label="Diseases";
		}else if (type==Biojs.AnnotatorBase.EFO){
			label="EFO";
		}else if (type==Biojs.AnnotatorBase.PHOSPHORYLATE_NACTEM){
			label="Phosphorylation Event";
		}else if (type==Biojs.AnnotatorBase.GENE_REF){
			label="Gene Function";
		}else if (type==Biojs.AnnotatorBase.OPEN_TARGET){
			label="Open Target";
		}else if (type==Biojs.AnnotatorBase.DISGENET){
			label="DisGeNET";
		}else if (type==Biojs.AnnotatorBase.NCBI){
			label="Genetic variations";
		}
		
		return label;
	},
	
	_getAnnotationDetailsLink: function (type, url){
		var label="";
		if (type==Biojs.AnnotatorBase.ACCESSION_NUMBERS){
			if (this._startsWith(url.toLowerCase(),"http://identifiers.org/pdb/")){ 
				label="PDB";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/treefam/")){ 
				label="TreeFam";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/uniprot/")){ 
				label="UniProt";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/arrayexpress/")){ 
				label="ArrayExpress";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/bioproject/")){ 
				label="BioProject";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/biosample/")){ 
				label="BioSample";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/clinicaltrials/")){ 
				label="Clinical Trial";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/doi/")){ 
				label="DOI";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/ega.study/")){ 
				label="EGA";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/emdb/")){ 
				label="EMDB";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/ensembl/")){ 
				label="Ensembl";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/ena.embl/")){ 
				label="ENA";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/go/")){ 
				label="Gene Ontology";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/interpro/")){ 
				label="InterPro";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/omim/")){ 
				label="OMIM";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/pfam/")){ 
				label="Pfam";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/proteomexchange/")){ 
				label="ProteomeXchange";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/refseq/")){ 
				label="RefSeq";
			}else if (this._startsWith(url.toLowerCase(),"http://identifiers.org/dbsnp/")){ 
				label="RefSNP";
			}else{
				label="Details";
			}
		}else if (type==Biojs.AnnotatorBase.GENES_PROTEINS){
			label="UniProt";
		}else if (type==Biojs.AnnotatorBase.ORGANISMS){
			label="Taxonomy";
		}else if (type==Biojs.AnnotatorBase.CHEMICALS){
			label="ChEBI";
		}else if (type==Biojs.AnnotatorBase.GO_TERMS){
			label="GO Term";
		}else if (type==Biojs.AnnotatorBase.DISEASE){
			label="Linked Life Data";
		}else if (type==Biojs.AnnotatorBase.EFO){
			label="EBI";
		}else if (type==Biojs.AnnotatorBase.PHOSPHORYLATE_NACTEM){
			label="UniProt";
		}else if (type==Biojs.AnnotatorBase.GENE_REF){
			label="UniProt";
		}else if (type==Biojs.AnnotatorBase.OPEN_TARGET){
			label="UniProt";
		}else if (type==Biojs.AnnotatorBase.DISGENET){
			label="DisGeNET";
		}else if (type==Biojs.AnnotatorBase.NCBI){
			label="NCBI";
		}
		
		return label;
	},
	
	_getAnnotationUrlEPMCsearch: function (annotation){
		var search= this._getAnnotationText(annotation);
		return "http://europepmc.org/search?query=\""+search+"\"";
	},
	
	_getAnnotationUrlEPMCsearchRefine: function (annotation){
		var search= this._getAnnotationText(annotation);
		var originalQuery= jQuery('#textfield').val();
		if (originalQuery!=undefined && originalQuery!=""){
			originalQuery = "http://europepmc.org/search?query="+originalQuery+" AND \""+search+"\"";
		}else{
			originalQuery="";
		}
		return originalQuery
		
	},
	
	_getAnnotationProvider: function(){
		return "Europe PMC";
	},
	
	_callBackJSFunctionality: function(){
		
	},
	
	_findText: function (pattern, articleText, startpos){
		
		var result={};
			
		result.index= articleText.indexOf(pattern, startpos);
		result.matchedText = pattern;
		
		return result;
	},
	
	_escapeRegExpText: function(text) {
		  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
	},
	
	_getRegularExpression:function(){
		return "(<{1}\/{0,1}(\\w|\\s|:|;|#|\"|\/|=)+>){0,1}";
		//return "(<{1}\/{0,1}\\w+>){0,1}";
	}
	
},{
	//Events 
	EVT_ON_ANNOTATIONS_LOADED: "onAnnotationsLoaded",
	EVT_ON_REQUEST_ERROR: "onRequestError",
	EVT_ON_TEXT_CHANGED: "onTextChanged"
});