class Square2D{
    static vertexPositions = [];
	static Colors = [];   
	static texcor = [];
	static conPoints = [];
	static Indices = [];
	static pos = [];

    static shaderProgram = -1;

    static positionBuffer = -1;
    static aPositionShader = -1;

    static cBuffer = -1;
	static aColor = -1;

	static tBuffer = -1;
	static aText = -1;

	static pointBuffer = -1;
	static aPoint = -1;

	static iBuffer = -1;

	static eye = -1;
	static at = vec3(0.0, 0.0, 0.0);
	static up = vec3(0.0, 1.0, 0.0);

	static lightpos = vec4(1.0, 3.0, 1.0, 1.0);
	static lightTwo = vec4(0.0, 0.0, 0.0, 0.0);
	static ambiant  = vec4(0.2, 0.2, 0.2, 1.0);
	static diffuse  = vec4(0.6, 0.6, 0.6, 1.0);
	static specular = vec4(1.0, 1.0, 1.0, 1.0);

	static ambMat   = vec4(0.6, 0.2, 0.2, 1.0);
	static diffMat  = vec4(0.9, 0.1, 0.1, 1.0);
	static specMAt  = vec4(0.8, 0.8, 0.8, 1.0);
	static shineMat = 80.0;

	//second mat
	static shineMat2 = 80.0;
	static diffMat2  = vec4(0.9, 0.1, 0.1, 1.0);
	static diffuse2  = vec4(0.6, 0.6, 0.6, 1.0);

	static specMAt2  = vec4(0.8, 0.8, 0.8, 1.0);
	static specular2 = vec4(1.0, 1.0, 1.0, 1.0);

	static ambProd;
	static difProd;
	static specProd;
	static specProd2;
	static difProd2;

	static fovy = 70.0;
	static aspect = 1;
	static near = 1.0;
	static far = 2.5;

	static left = -1.0;
	static right = 1.0;
	static top = 2.0;
	static bottom = -2.0;

	static rad = 2.0;
	static theta = 1.0;
	static phi = 1.0;
	static dr = 5.0 * Math.PI/180.0;

	static modelViewMatrix = -1;
	static modelViewMatrixLoc = -1;

	static projectionMatrix = -1;
	static projectionMatrixLoc = -1;

	static count = 0;
	static projection = 2;

	static nu = 10;
	static mv = 10;

	static loc1;
	static loc2;
	static loc3;
	static loc4;
	static loc5;
	static loc6;
	static loc7;
	static loc8;
	static loc9;
	static sampler;
	static bezTex;

	static L = 0;
	static R = 0;
	static D = 2.0;

	static generateBez(points, uDiv, vDiv) {
		for (let ii=0; ii <=uDiv; ii++){
		  var uu = ii/uDiv;
		  for (let jj=0; jj <=vDiv; jj++){
			var vv = jj/vDiv;
			var pp = bezPatch(points, uu, vv);
			Square2D.vertexPositions.push(vec3(pp[0], pp[1], pp[2]));
	  
			if(ii< uDiv && jj <vDiv){
			  var ind = ii * (uDiv+1) +jj;
			  Square2D.Indices.push(ind, ind+vDiv+1, ind+1);
			  Square2D.Indices.push(ind+1, ind+vDiv+1, ind+vDiv+2);
			  Square2D.count +=6;
			}
		  }
		}
	  }
    static initialize(){
	Square2D.shaderProgram = initShaders( gl, "./vshader.glsl", "./fshader.glsl");
	
	//-------------------------------------------------------------------------------------------------------
	//reading patch control points 
	var smf_file = loadFileAJAX("patch.txt");
    var lines = smf_file.split('\n');

    for (var line=0; line<lines.length; line++){
    	var strings = lines[line].trimEnd().split(' ');
		var v = vec3(parseFloat(strings[0]), parseFloat(strings[1]), parseFloat(strings[2]));
    	Square2D.conPoints.push(v);
  	}
	Square2D.generateBez(Square2D.conPoints, Square2D.nu, Square2D.mv);

	for (var f=0; f<Square2D.Indices.length; f++){
		Square2D.pos.push(Square2D.vertexPositions[Square2D.Indices[f]]);
	}
	console.log(Square2D.vertexPositions);
	console.log(Square2D.Indices);
	console.log(Square2D.pos);
	console.log(Square2D.count);
	//---------------------------------------------------------------------------------------------------------
	
	Square2D.sampler = gl.getUniformLocation(Square2D.shaderProgram, "sampler");

	var loadT = function(url){
	var texture = gl.createTexture();
	var image = new Image();
	image.crossOrigin = "Anonymous";
	image.src = url + "?dont-use-cache";

	image.onload = function() {
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

		var maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
		console.log("Max texture size: " + maxSize);
		var width = image.width;
        var height = image.height;
        if (width > maxSize || height > maxSize) {
            console.log("Image dimensions (" + width + "x" + height + ") exceed maximum texture size of " + maxSize + "x" + maxSize);
            return;
        }
        if ((width & (width - 1)) || (height & (height - 1))) {
            console.log("Image dimensions (" + width + "x" + height + ") are not powers of two");
            if (!gl.getExtension("OES_texture_npot")) {
                console.log("Texture dimensions are not powers of two and OES_texture_npot extension is not supported");
                return;
            }
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
         		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
        }
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.uniform1i(Square2D.sampler, 0);
		};
		return texture;
	};
	Square2D.bezTex = loadT("breen.jpg");
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, Square2D.bezTex);
	//---------------------------------------------------------------------------------------------------------
	for (let i=0; i < Square2D.pos.length; i+=3){
		
		Square2D.Colors.push(vec4(Square2D.pos[i][0], Square2D.pos[i][1], Square2D.pos[i][2], 0.0));
		Square2D.Colors.push(vec4(Square2D.pos[i+1][0], Square2D.pos[i+1][1], Square2D.pos[i+1][2], 0.0));
		Square2D.Colors.push(vec4(Square2D.pos[i+2][0], Square2D.pos[i+2][1], Square2D.pos[i+2][2], 0.0));
	}
	console.log(Square2D.Colors);
	for (let i=0; i < Square2D.pos.length; i+=4){
		Square2D.texcor.push(vec2(0, 0));
		Square2D.texcor.push(vec2(1, 0));
		Square2D.texcor.push(vec2(1, 1));
		Square2D.texcor.push(vec2(0, 1));
	}
	console.log(Square2D.texcor);
	//----------------------------------------------------------------------------------------------------------

	Square2D.ambProd = mult(Square2D.ambiant, Square2D.ambMat);
	Square2D.difProd = mult(Square2D.diffuse, Square2D.diffMat);
	Square2D.specProd= mult(Square2D.specular, Square2D.specMAt);

	Square2D.specProd2= mult(Square2D.specular2, Square2D.specMAt2);
	Square2D.difProd2 = mult(Square2D.diffuse2, Square2D.diffMat2);

	Square2D.positionBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, Square2D.positionBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(Square2D.pos), gl.STATIC_DRAW );
	Square2D.aPositionShader = gl.getAttribLocation( Square2D.shaderProgram, "aPosition" );
	
	Square2D.cBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, Square2D.cBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(Square2D.Colors), gl.STATIC_DRAW );
	Square2D.aColor = gl.getAttribLocation( Square2D.shaderProgram, "aColor" );

	Square2D.tBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, Square2D.tBuffer );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(Square2D.texcor), gl.STATIC_DRAW );
	Square2D.aText = gl.getAttribLocation( Square2D.shaderProgram, "aText" );
	

	Square2D.modelViewMatrixLoc = gl.getUniformLocation(Square2D.shaderProgram, "umodelViewMatrix");
	Square2D.projectionMatrixLoc = gl.getUniformLocation(Square2D.shaderProgram,"uprojectionMatrix");
	
	Square2D.loc1 = gl.getUniformLocation(Square2D.shaderProgram, "uAmb");
	Square2D.loc2 = gl.getUniformLocation(Square2D.shaderProgram, "uDiff");
	Square2D.loc3 = gl.getUniformLocation(Square2D.shaderProgram, "uSpec");
	Square2D.loc4 = gl.getUniformLocation(Square2D.shaderProgram, "uLight");
	Square2D.loc5 = gl.getUniformLocation(Square2D.shaderProgram, "uShine");
	Square2D.loc6 = gl.getUniformLocation(Square2D.shaderProgram, "uLightTwo");
	Square2D.loc7 = gl.getUniformLocation(Square2D.shaderProgram, "uShinetwo");
	Square2D.loc8 = gl.getUniformLocation(Square2D.shaderProgram, "uSpec2");
	Square2D.loc9 = gl.getUniformLocation(Square2D.shaderProgram, "uDiff2");
    }
    	
    constructor(){
        if(Square2D.shaderProgram == -1)
			Square2D.initialize()
    }

	view(mode){
		if (mode == 1){
			Square2D.projection = 1;
		} 
		else if (mode == 2){
			Square2D.projection = 2;
		} 
	}
	cam(x){
		if (x==1){
			Square2D.L += 0.5;
		}
		else if (x==2){
			Square2D.L -= 0.5;
		}
		else if (x==3){
			Square2D.theta += 0.1;
		}
		else if(x==4){
			Square2D.theta -= 0.1;
		}
		else if (x==5){
			Square2D.R += 0.5;
		}
		else if(x==6){
			Square2D.R -= 0.5;
		}
		else if(x==7){
			if(Square2D.D > 0){
				Square2D.D += 1.0;
			}
		}
		else if(x==8){
			if(Square2D.D > 0){
				Square2D.D -= 0.5;
			}
		}
	}
	redraw(){
		Square2D.Indices = [];
		Square2D.vertexPositions = [];
		Square2D.pos = [];
		Square2D.Colors = [];
		Square2D.count = 0;

	}
	draw(){
    	gl.useProgram(Square2D.shaderProgram);
		gl.uniform1i(Square2D.sampler, 0);
		gl.bindTexture(gl.TEXTURE_2D, Square2D.bezTex);
		
		gl.bindBuffer( gl.ARRAY_BUFFER, Square2D.tBuffer );
		gl.vertexAttribPointer(Square2D.aText, 2, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray(Square2D.aText); 

		gl.bindBuffer( gl.ARRAY_BUFFER, Square2D.positionBuffer);
    	gl.vertexAttribPointer(Square2D.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray(Square2D.aPositionShader);   


		gl.bindBuffer( gl.ARRAY_BUFFER, Square2D.cBuffer );
		gl.vertexAttribPointer(Square2D.aColor, 4, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray(Square2D.aColor); 

		Square2D.lightTwo[0] = Square2D.D *Math.sin(Square2D.L);
		Square2D.lightTwo[1] = Square2D.D *Math.sin(Square2D.R);
		Square2D.lightTwo[2] = Square2D.D *Math.cos(Square2D.L);
		Square2D.lightTwo[3] = Square2D.D *Math.cos(Square2D.R);

	
		Square2D.eye = vec3(Square2D.rad*Math.sin(Square2D.theta), Square2D.rad*Math.cos(Square2D.phi), Square2D.rad*Math.cos(Square2D.theta));

		Square2D.modelViewMatrix = lookAt(Square2D.eye, Square2D.at, Square2D.up);
		if (Square2D.projection == 1){
			Square2D.projectionMatrix = perspective(Square2D.fovy, 1, Square2D.near, Square2D.far);

		} else if (Square2D.projection == 2){
			Square2D.projectionMatrix = ortho(Square2D.left, Square2D.right, Square2D.bottom, Square2D.top, Square2D.near, Square2D.far);
		} 
		gl.uniform4fv(Square2D.loc1, flatten(Square2D.ambProd));
		gl.uniform4fv(Square2D.loc2, flatten(Square2D.difProd));
		gl.uniform4fv(Square2D.loc3, flatten(Square2D.specProd));
		gl.uniform4fv(Square2D.loc4, flatten(Square2D.lightpos));
		gl.uniform4fv(Square2D.loc6, flatten(Square2D.lightTwo));
		gl.uniform1f(Square2D.loc5, Square2D.shineMat);
		gl.uniform1f(Square2D.loc7, Square2D.shineMat2);
		gl.uniform4fv(Square2D.loc8, flatten(Square2D.specProd2));
		gl.uniform4fv(Square2D.loc9, flatten(Square2D.difProd2));

		gl.uniformMatrix4fv(Square2D.modelViewMatrixLoc, false, flatten(Square2D.modelViewMatrix));
		gl.uniformMatrix4fv(Square2D.projectionMatrixLoc, false, flatten(Square2D.projectionMatrix));
		
		gl.drawArrays( gl.TRIANGLES, 0, Square2D.count);
    }
}

