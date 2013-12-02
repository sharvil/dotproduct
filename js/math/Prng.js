// this program is a JavaScript version of Mersenne Twister,
// a straight conversion from the original program, mt19937ar.c,
// translated by y. okada on july 17, 2006.
// and modified a little at july 20, 2006, but there are not any substantial differences.
// in this program, procedure descriptions and comments of original source code were not removed.
// lines commented with //c// were originally descriptions of c procedure. and a few following lines are appropriate JavaScript descriptions.
// lines commented with /* and */ are original comments.
// lines commented with // are additional comments in this JavaScript version.
/*
   A C-program for MT19937, with initialization improved 2002/1/26.
   Coded by Takuji Nishimura and Makoto Matsumoto.

   Before using, initialize the state by using init_genrand(seed)
   or init_by_array(init_key, key_length).

   Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
   All rights reserved.

   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions
   are met:

     1. Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.

     2. Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.

     3. The names of its contributors may not be used to endorse or promote
        products derived from this software without specific prior written
        permission.

   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
   A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


   Any feedback is very welcome.
   http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/emt.html
   email: m-mat @ math.sci.hiroshima-u.ac.jp (remove space)
*/

goog.provide('math.Prng');

/**
 * @constructor
 */
math.Prng = function() {
  this.mt_ = new Array(math.Prng.N_);  /* the array for the state vector  */
  this.mti_ = math.Prng.N_ + 1;        /* mti==N+1 means mt[N] is not initialized */
};

math.Prng.N_ = 624;
math.Prng.M_ = 397;
math.Prng.MATRIX_A_ = 0x9908b0df;   /* constant vector a */
math.Prng.UPPER_MASK_ = 0x80000000; /* most significant w-r bits */
math.Prng.LOWER_MASK_ = 0x7fffffff; /* least significant r bits */

// returns a 32-bits unsigned integer from an operand to which applied a bit operator.
math.Prng.prototype.unsigned32_ = function(n1) {
  return n1 < 0 ? (n1 ^ math.Prng.UPPER_MASK_) + math.Prng.UPPER_MASK_ : n1;
};

// emulates lowerflow of a c 32-bits unsiged integer variable, instead of the operator -. these both arguments must be non-negative integers expressible using unsigned 32 bits.
math.Prng.prototype.subtraction32_ = function(n1, n2) {
  return n1 < n2 ? this.unsigned32_((0x100000000 - (n2 - n1)) & 0xffffffff) : n1 - n2;
};

// emulates overflow of a c 32-bits unsiged integer variable, instead of the operator +. these both arguments must be non-negative integers expressible using unsigned 32 bits.
math.Prng.prototype.addition32_ = function(n1, n2) {
  return this.unsigned32_((n1 + n2) & 0xffffffff);
};

// emulates overflow of a c 32-bits unsiged integer variable, instead of the operator *. these both arguments must be non-negative integers expressible using unsigned 32 bits.
math.Prng.prototype.multiplication32_ = function(n1, n2) {
  var sum = 0;
  for (var i = 0; i < 32; ++i) {
    if ((n1 >>> i) & 0x1) {
      sum = this.addition32_(sum, this.unsigned32_(n2 << i));
    }
  }
  return sum;
};

/* initializes mt[N] with a seed */
math.Prng.prototype.seed = function(s) {
  this.mt_[0] = this.unsigned32_(s & 0xffffffff);
  for (this.mti_ = 1; this.mti_ < math.Prng.N_; this.mti_++) {
    this.mt_[this.mti_] = this.addition32_(this.multiplication32_(1812433253,
                               this.unsigned32_(this.mt_[this.mti_ - 1] ^ (this.mt_[this.mti_ - 1] >>> 30))),
                               this.mti_);
		/* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
		/* In the previous versions, MSBs of the seed affect   */
		/* only MSBs of the array mt[].                        */
		/* 2002/01/09 modified by Makoto Matsumoto             */
		this.mt_[this.mti_] = this.unsigned32_(this.mt_[this.mti_] & 0xffffffff);
	}
};

/* generates a random number on [0,0xffffffff]-interval */
math.Prng.prototype.random = function() {
	var y;
	var mag01 = new Array(0x0, math.Prng.MATRIX_A_);

	if (this.mti_ >= math.Prng.N_) { /* generate N words at one time */
		var kk;

		if (this.mti_ == math.Prng.N_ + 1) {   /* if init_genrand() has not been called, */
			this.seed(5489); /* a default initial seed is used */
		}

		for (kk = 0; kk < math.Prng.N_ - math.Prng.M_; kk++) {
			y = this.unsigned32_((this.mt_[kk] & math.Prng.UPPER_MASK_) | (this.mt_[kk + 1] & math.Prng.LOWER_MASK_));
			this.mt_[kk] = this.unsigned32_(this.mt_[kk + math.Prng.M_] ^ (y >>> 1) ^ mag01[y & 0x1]);
		}
		for (; kk < math.Prng.N_ - 1; kk++) {
			y = this.unsigned32_((this.mt_[kk] & math.Prng.UPPER_MASK_) | (this.mt_[kk + 1] & math.Prng.LOWER_MASK_));
			this.mt_[kk] = this.unsigned32_(this.mt_[kk + (math.Prng.M_ - math.Prng.N_)] ^ (y >>> 1) ^ mag01[y & 0x1]);
		}

		y = this.unsigned32_((this.mt_[math.Prng.N_ - 1] & math.Prng.UPPER_MASK_) | (this.mt_[0] & math.Prng.LOWER_MASK_));
		this.mt_[math.Prng.N_ - 1] = this.unsigned32_(this.mt_[math.Prng.M_ - 1] ^ (y >>> 1) ^ mag01[y & 0x1]);
		this.mti_ = 0;
	}

	y = this.mt_[this.mti_++];

	/* Tempering */
	y = this.unsigned32_(y ^ (y >>> 11));
	y = this.unsigned32_(y ^ ((y << 7) & 0x9d2c5680));
	y = this.unsigned32_(y ^ ((y << 15) & 0xefc60000));
	y = this.unsigned32_(y ^ (y >>> 18));

	return y;
};
