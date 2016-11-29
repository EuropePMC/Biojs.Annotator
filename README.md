# SciLite Annotation platform

Scilite is an annotation platform developed as part of Europe PMC (www.europepmc.org), a repository for scientific articles in the Life Science domain. Below we describe the core component of SciLite that is responsible for rendering text-mined annotations on the HTML page. This component was developed to suit the Europe PMC architecture. Hence this repository contains a skeletal implementation of the SciLite component and users are required to customise it to their own environment (e.g. the back-end infrastructure to store/ retrieve annotations). If you have a specific use case and you need further information kindly contact us. As we progress with developments on EuropePMC environment we shall update with the subsequent versions at later stage.

# Biojs.Annotator

[![DOI](https://zenodo.org/badge/74970144.svg)](https://zenodo.org/badge/latestdoi/74970144)

This is the core component that is responsible for highlighting text-mined annotations of different semantic types tagged in a full text article (identified by a PMCID parameter) on the HTML page.
The annotations are retrieved through an AJAX call to a back-end page (see the proxyUrl option in the section below) that will retrieve the required annotations for a given PMCID. A typical example of a back-end page is annotation_biojs.jsp inside the folder java.
The component is expecting this back-end page to return annotations for the specified PMCID in the following JSON format :
 ```javascript
 {"pmcId":"PMC5047790","results":{"distinct":false,"ordered":true,"bindings":[{"annotation"
:{"value":"http://rdf.ebi.ac.uk/resource/europepmc/annotations/PMC5047790#1-1"},"position":{"value":"1
.1"},"tag":{"value":"http://purl.obolibrary.org/obo/CHEBI_26092"},"prefix":{"value":""},"exact":{"value"
:"Phthalates"},"postfix":{"value":" in Fast Food: A Potential Dietary Sourc"},"pmcid":"PMC5047790"},
{"annotation":{"value":"http://rdf.ebi.ac.uk/resource/europepmc/annotations/PMC5047790#2-2"
},"position":{"value":"2.2"},"tag":{"value":"http://purl.obolibrary.org/obo/CHEBI_22901"},"prefix":{"value"
:"ood Consumption and "},"exact":{"value":"Bisphenol"},"postfix":{"value":" A and Phthalates Ex"},"pmcid"
:"PMC5047790"}]}}
 ```

## Example of use

You can see the file located at /examples/FulltextPage.html for a simple example of usage

```javascript
             var annotator = new Biojs.Annotator({
				target: 'fulltext_container',  
				pmcId: 'PMC5047790',
				proxyUrl:"../java/annotation_biojs.jsp",
				idLegend: 'legend_container'
		    });	
		    /**triggers the annotations retrieval process*/
			annotator.load();

```

## Options

@param {Object} options An object with the options for the Annotator component.
   
@option {string} [target='fulltext_container']
   Identifier of the DIV tag where the full text of the article is present in the HTML page. It is a mandatory parameter.
  
@option {string} [pmcId='PMC5047790']
   PMCID of the article that is displayed in the HTML page, that we want to annotate. It is a mandatory parameter.

@option {string} [idLegend='legend_container']
   Identifier of the DIV tag that will contain the legend to display all the semantic types found in the article with the possibility for the user to enable/disable their highlighting. It is a mandatory parameter.
  
@option {string} [proxyUrl='../java/annotation_biojs.jsp']
   Contains the path to the back-end page used to retrieve the annotations for a given PMCID. It is a mandatory parameter.


## License 

This software is licensed under the Apache 2 license, quoted below.

Copyright (c) 2016, EuropePMC

Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.

