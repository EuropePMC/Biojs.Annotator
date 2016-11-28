function AnnotatorSharedData() {
	this._dataResult =[];
	this._rehighlightIteration = 0;
	this._annotationsFound = [];
}

AnnotatorSharedData.prototype.setDataResult = function (dataResult){
	this._dataResult = dataResult;
}

AnnotatorSharedData.prototype.appendDataResult = function (dataResult){
	
	var appendDataResultOk=true;
	if (this._dataResult.length>0){
		for (var i=0;i<this._dataResult.length; i++){
			if ((this._dataResult[i].type==dataResult.type) && (this._dataResult[i].offset.startIndex == dataResult.offset.startIndex) && (this._dataResult[i].offset.endIndex == dataResult.offset.endIndex)){
				appendDataResultOk=false;
				break;
			}
		}
	}
	
	if (appendDataResultOk==true){ 
		this._dataResult[this._dataResult.length] = dataResult;
	}
	
	return appendDataResultOk;
}

AnnotatorSharedData.prototype.getDataResult = function (){
	return this._dataResult;
}

AnnotatorSharedData.prototype.incRehighlightIteration = function (){
	this._rehighlightIteration = this._rehighlightIteration + 1;
}

AnnotatorSharedData.prototype.getRehighlightIteration = function (){
	return this._rehighlightIteration;
}

AnnotatorSharedData.prototype.appendAnnotationFound = function (annotationsFound){
	annotationsFound.idAnnotations=[];
	annotationsFound.currentIndex=-1;
	this._annotationsFound[this._annotationsFound.length] = annotationsFound;
	
}

AnnotatorSharedData.prototype.getAnnotationFound = function (){
	return this._annotationsFound;
}

AnnotatorSharedData.prototype.isAnnotationFound = function (annotation){
	if (this._annotationsFound.length==0){
		return false;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			if (this._annotationsFound[i].type==annotation){
				return true;
			}
		}
	}
	
	return false;
}

AnnotatorSharedData.prototype.incAnnotationFound = function (type){
	if (this._annotationsFound.length==0){
		return;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			if (this._annotationsFound[i].type==type){
				this._annotationsFound[i].total = this._annotationsFound[i].total + 1;
				break;
			}
		}
	}
}

AnnotatorSharedData.prototype.resetAnnotationFoundTotal = function (type){
	if (this._annotationsFound.length==0){
		return;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			if (this._annotationsFound[i].type==type){
				this._annotationsFound[i].total = 0;
				break;
			}
		}
	}
}

AnnotatorSharedData.prototype.getAnnotationFoundTotal = function (type){
	var ret=0;
	if (this._annotationsFound.length==0){
		return ret;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			if (this._annotationsFound[i].type==type){
				ret = this._annotationsFound[i].total;
				break;
			}
		}
	}
	
	return ret;
}

AnnotatorSharedData.prototype.resetRegisterIdAnnotationFound = function (keepCurrentIndex){
	if (this._annotationsFound.length==0){
		return;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			this._annotationsFound[i].idAnnotations= [];
			if (keepCurrentIndex==false){ 
				this._annotationsFound[i].currentIndex=-1;
			}
		}
	}
}

AnnotatorSharedData.prototype.registerIdAnnotationFound = function (idAnnotation, type){
	if (this._annotationsFound.length==0){
		return;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			if (this._annotationsFound[i].type==type){
				this._annotationsFound[i].idAnnotations[this._annotationsFound[i].idAnnotations.length] = idAnnotation;	
				break;
			}
		}
		return idAnnotation;
	}
}


AnnotatorSharedData.prototype.goToNextAnnotation = function (type, label){
	var idAnnotation="";
	if (this._annotationsFound.length==0){
		return idAnnotation;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			if (this._annotationsFound[i].type==type){
				if (this._annotationsFound[i].idAnnotations.length > (this._annotationsFound[i].currentIndex + 1)){
					if (this._annotationsFound[i].currentIndex >= 0){ 
						jQuery('#'+this._annotationsFound[i].idAnnotations[this._annotationsFound[i].currentIndex]).removeClass('annotationFound');
					}
					this._annotationsFound[i].currentIndex = this._annotationsFound[i].currentIndex + 1;
				}else{
					jQuery('#'+this._annotationsFound[i].idAnnotations[this._annotationsFound[i].currentIndex]).removeClass('annotationFound');
					this._annotationsFound[i].currentIndex = 0;
				}
				
				idAnnotation = this._annotationsFound[i].idAnnotations[this._annotationsFound[i].currentIndex];
				jQuery('#'+this._annotationsFound[i].idAnnotations[this._annotationsFound[i].currentIndex]).addClass('annotationFound');
				
				var self=this;
				setTimeout(function(){ jQuery('#'+self._annotationsFound[i].idAnnotations[self._annotationsFound[i].currentIndex]).removeClass('annotationFound'); }, 350);
				var labelLegendId='label_legend_annotation_'+type;
				var labelLegend= ' '+label+' ('+(this._annotationsFound[i].currentIndex+ 1)+" of "+this._annotationsFound[i].total+')';
				jQuery('#'+labelLegendId).html(labelLegend);
				
				break;
			}
		}
		return idAnnotation;
	}
}

AnnotatorSharedData.prototype.goToPreviousAnnotation = function (type, label){
	var idAnnotation="";
	if (this._annotationsFound.length==0){
		return idAnnotation;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			if (this._annotationsFound[i].type==type){
				if ((this._annotationsFound[i].currentIndex >=1)){
					jQuery('#'+this._annotationsFound[i].idAnnotations[this._annotationsFound[i].currentIndex]).removeClass('annotationFound');
					this._annotationsFound[i].currentIndex = this._annotationsFound[i].currentIndex - 1;
				}else{
					if (this._annotationsFound[i].currentIndex >= 0){ 
						jQuery('#'+this._annotationsFound[i].idAnnotations[this._annotationsFound[i].currentIndex]).removeClass('annotationFound');
					}
					this._annotationsFound[i].currentIndex= this._annotationsFound[i].idAnnotations.length - 1;
				}
				
				idAnnotation = this._annotationsFound[i].idAnnotations[this._annotationsFound[i].currentIndex];
				jQuery('#'+this._annotationsFound[i].idAnnotations[this._annotationsFound[i].currentIndex]).addClass('annotationFound');
				
				var self=this;
				setTimeout(function(){ jQuery('#'+self._annotationsFound[i].idAnnotations[self._annotationsFound[i].currentIndex]).removeClass('annotationFound'); }, 350);
				
				var labelLegendId='label_legend_annotation_'+type;
				var labelLegend= ' '+label+' ('+(this._annotationsFound[i].currentIndex+ 1)+" of "+this._annotationsFound[i].total+')';
				jQuery('#'+labelLegendId).html(labelLegend);
				break;
			}
		}
		return idAnnotation;
	}
}

AnnotatorSharedData.prototype.getAnnotationFoundType = function (type){
	var ret=null;
	
	for (var i=0;i<this._annotationsFound.length; i++){
		if (this._annotationsFound[i].type==type){
			ret = this._annotationsFound[i];
			break;
		}
	}
	
	return ret;
}

AnnotatorSharedData.prototype.getCurrentIndex = function (type){
	if (this._annotationsFound.length==0){
		return -1;
	}else{
		for (var i=0;i<this._annotationsFound.length; i++){
			if (this._annotationsFound[i].type==type){
				return this._annotationsFound[i].currentIndex;	
			}
		}
		
	}
	
	return -1;
}

AnnotatorSharedData.prototype.setCurrentIndex = function (type, currentIndex){
	for (var i=0;i<this._annotationsFound.length; i++){
		if (this._annotationsFound[i].type==type){
			this._annotationsFound[i].currentIndex = currentIndex;	
			break;
		}
	}
	
}
