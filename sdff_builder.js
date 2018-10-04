module.exports = {
	makeBoxHeader: makeBoxHeader,
	pushInt8: pushInt8,
	pushInt16BE: pushInt16BE,

	makeDispBoxHeader: makeDispBoxHeaderV1
};


	
	function makeDispBoxHeaderV1(cols, rows, size){
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

