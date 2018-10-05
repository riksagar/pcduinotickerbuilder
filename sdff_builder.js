module.exports = {
	makeBoxHeader: makeBoxHeader,
	pushInt8: pushInt8,
	pushInt16BE: pushInt16BE,

	makeDispBoxHeader: makeDispBoxHeader,

	serializeDisplay: serializeDisplay,
	serializeScript: serializeScript
};


	
	function makeDispBoxHeader(cols, rows, size){
		size += 8; // Size of box header itself...
		size += 2; // Width + Height is 2 bytes...
		var ret = makeBoxHeader('disp', 0x01, 0x00, size);
		ret.push(cols);
		ret.push(rows);
	
		return ret;
	}
	
	function makeBoxHeader(boxType, version, flags, size){
		var ret = [];
		ret.push((size>>8)&0xff);
		ret.push(size&0xff);
		ret.push(boxType.charCodeAt(0));
		ret.push(boxType.charCodeAt(1));
		ret.push(boxType.charCodeAt(2));
		ret.push(boxType.charCodeAt(3));
	
		var vandf = (version&0xf);
		vandf <<= 4;
		vandf |= (flags>>8)&0xf;
		ret.push(vandf);
		ret.push(flags&0xff);
	
		return ret;
	}
	
	function pushInt16BE(arr, num){
		var num_
		if (num < 0){
			num_ = -num;
		}
		else {
			num_ = num;
		}
	
		num_ &= 0xffff;
		if (num < 0){
			num_ = ~num_;
			num_ += 1;
		}
		var low = 0xff&num_;
		num_ >>= 8;
		var high = 0xff&num_;
		arr.push(high, low);
	}
	function pushInt8(arr, num){
		var num_;
		if (num < 0){
			num_ = -num;
		}
		else {
			num_ = num;
		}
	
		num_ &= 0x7f;
	
		if (num < 0){
			num_ = ~num;
			num_ += 1;
		}
		num_ &= 0xff;
	
		arr.push(num_);
	}

	function serializeDisplay(displayStateJSON){

		var colList = [];


		for (var pixelCol = 0; pixelCol != displayStateJSON.columnData.length; ++pixelCol){
			for (var pixelRow = 0; pixelRow != displayStateJSON.columnData[pixelCol].length; ++pixelRow){
	
				var pixelState = displayStateJSON.columnData[pixelCol][pixelRow];
				var colData = colList[pixelCol]||0;
	
				var pixelBits = pixelState << (pixelRow*2);
				var pixelMask = 0x03 << (pixelRow*2);
				console.log(
					"Pixel: " + pixelCol + "x" + pixelRow
						+ "; Pixel State: " + pixelState
						+ "; Pixel Mask: " + pixelMask
						+ "; Pixel Data: " + pixelBits);
				pixelMask ^= 0xff;
				colData |= pixelBits;
				colList[pixelCol] = colData;
			}
		}
	
		var arr = [];
	
		// create V0 file header, so reader can parse correctly.
		arr.push.apply(arr, makeDispBoxHeader(displayStateJSON.columns, displayStateJSON.rows, colList.length*4));
	
		for (var idx=0; idx !== colList.length; ++idx){
			var item = colList[idx];
			arr.push( (item>>24)&0xff );
			arr.push( (item>>16)&0xff );
			arr.push( (item>>8)&0xff );
			arr.push( item&0xff );
		}
	
		return arr;
	
	}

	function serializeScript(scriptJSON){

		var ret = serializeScriptBox(scriptJSON.flags);
		for (var idx=0; idx != scriptJSON.count; ++idx){
			console.log(
				"Serialize script action box: "
				+ idx
				+ "/"
				+ scriptJSON.count
				+ "; type: "
				+ scriptJSON.items[idx].type);
	
			var boxBytes;
			switch(scriptJSON.items[idx].type){
				case "scroll":
					boxBytes = serializeScrollScriptAction(scriptJSON.items[idx]);				
					break;
				case "pause":
					boxBytes = serializePauseScriptAction(scriptJSON.items[idx]);				
					break;
				case "position":
					boxBytes = serializePositionScriptAction(scriptJSON.items[idx]);
					break;
				default:
					console.error("Invalid script action type: "+scriptJSON.items[idx].type);
					break;
			}
	
			ret.push.apply(ret, boxBytes);
		}
	
		return ret;
	}
	
	function serializeScriptBox(flags){
		var arr = [];
	
		arr.push.apply(arr, makeBoxHeader("scpt", 0, flags, 8));
	
		return arr;
	}
	
	function serializeScrollScriptAction(action){
		var arr = [];
	
		arr.push.apply(arr, makeBoxHeader("sscr", 0, 0, 13))
		pushInt16BE(arr, action.step);
		pushInt16BE(arr, action.delay);
		pushInt8(arr, action.count);
	
		return arr;
	}
	
	function serializePositionScriptAction(action){
		var arr = [];
	
		arr.push.apply(arr, makeBoxHeader("spos", 0, 0, 10))
		pushInt16BE(arr, action.position);
	
		return arr;
	}
	
	function serializePauseScriptAction(action){
		var arr = [];
	
		arr.push.apply(arr, makeBoxHeader("spau", 0, 0, 10))
		pushInt16BE(arr, action.duration);
	
		return arr;
	}
	
	
	
	
