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

export default class Prng {
  private static readonly N_ = 624;
  private static readonly M_ = 397;
  private static readonly MATRIX_A_ = 0x9908b0df;
  private static readonly UPPER_MASK_ = 0x80000000;
  private static readonly LOWER_MASK_ = 0x7fffffff;

  private mt_ : Array<number>;
  private mti_ : number;

  constructor() {
    this.mt_ = new Array(Prng.N_);  /* the array for the state vector  */
    this.mti_ = Prng.N_ + 1;        /* mti==N+1 means mt[N] is not initialized */
  }

  // initializes mt[N] with a seed
  public seed(s : number) {
    this.mt_[0] = this.unsigned32_(s & 0xffffffff);
    for (this.mti_ = 1; this.mti_ < Prng.N_; this.mti_++) {
      this.mt_[this.mti_] = this.addition32_(this.multiplication32_(1812433253,
        this.unsigned32_(this.mt_[this.mti_ - 1] ^ (this.mt_[this.mti_ - 1] >>> 30))),
        this.mti_);
      /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
      /* In the previous versions, MSBs of the seed affect   */
      /* only MSBs of the array mt[].                        */
      /* 2002/01/09 modified by Makoto Matsumoto             */
      this.mt_[this.mti_] = this.unsigned32_(this.mt_[this.mti_] & 0xffffffff);
    }
  }

  // generates a random number on [0,0xffffffff]-interval
  public random() : number {
    let y;
    let mag01 = new Array(0x0, Prng.MATRIX_A_);

    if (this.mti_ >= Prng.N_) { /* generate N words at one time */
      let kk;

      if (this.mti_ == Prng.N_ + 1) {   /* if init_genrand() has not been called, */
        this.seed(5489); /* a default initial seed is used */
      }

      for (kk = 0; kk < Prng.N_ - Prng.M_; kk++) {
        y = this.unsigned32_((this.mt_[kk] & Prng.UPPER_MASK_) | (this.mt_[kk + 1] & Prng.LOWER_MASK_));
        this.mt_[kk] = this.unsigned32_(this.mt_[kk + Prng.M_] ^ (y >>> 1) ^ mag01[y & 0x1]);
      }
      for (; kk < Prng.N_ - 1; kk++) {
        y = this.unsigned32_((this.mt_[kk] & Prng.UPPER_MASK_) | (this.mt_[kk + 1] & Prng.LOWER_MASK_));
        this.mt_[kk] = this.unsigned32_(this.mt_[kk + (Prng.M_ - Prng.N_)] ^ (y >>> 1) ^ mag01[y & 0x1]);
      }

      y = this.unsigned32_((this.mt_[Prng.N_ - 1] & Prng.UPPER_MASK_) | (this.mt_[0] & Prng.LOWER_MASK_));
      this.mt_[Prng.N_ - 1] = this.unsigned32_(this.mt_[Prng.M_ - 1] ^ (y >>> 1) ^ mag01[y & 0x1]);
      this.mti_ = 0;
    }

    y = this.mt_[this.mti_++];

    /* Tempering */
    y = this.unsigned32_(y ^ (y >>> 11));
    y = this.unsigned32_(y ^ ((y << 7) & 0x9d2c5680));
    y = this.unsigned32_(y ^ ((y << 15) & 0xefc60000));
    y = this.unsigned32_(y ^ (y >>> 18));

    return y;
  }

  // returns a 32-bits unsigned integer from an operand to which applied a bit operator.
  private unsigned32_(n1 : number) : number {
    return n1 < 0 ? (n1 ^ Prng.UPPER_MASK_) + Prng.UPPER_MASK_ : n1;
  }

  // emulates lowerflow of a c 32-bits unsiged integer variable, instead of the operator -. these both arguments must be non-negative integers expressible using unsigned 32 bits.
  private subtraction32_(n1 : number, n2 : number) : number {
    return n1 < n2 ? this.unsigned32_((0x100000000 - (n2 - n1)) & 0xffffffff) : n1 - n2;
  }

  // emulates overflow of a c 32-bits unsiged integer variable, instead of the operator +. these both arguments must be non-negative integers expressible using unsigned 32 bits.
  private addition32_(n1 : number, n2 : number) : number {
    return this.unsigned32_((n1 + n2) & 0xffffffff);
  }

  // emulates overflow of a c 32-bits unsiged integer variable, instead of the operator *. these both arguments must be non-negative integers expressible using unsigned 32 bits.
  private multiplication32_(n1 : number, n2 : number) : number {
    let sum = 0;
    for (let i = 0; i < 32; ++i) {
      if ((n1 >>> i) & 0x1) {
        sum = this.addition32_(sum, this.unsigned32_(n2 << i));
      }
    }
    return sum;
  }
}
