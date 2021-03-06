/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *

import { Timestamp } from '../../../src/api/timestamp';
import { Code } from '../../../src/util/error';
import { addEqualityMatcher } from '../../util/equality_matcher';

describe('Timestamp', () => {
  addEqualityMatcher();

  it('constructor should validate the "seconds" argument and store it', () => {
    expect(new Timestamp(1, 0)).to.have.property('seconds', 1);
    expect(new Timestamp(-62135596800, 0)).to.have.property(
      'seconds',
      -62135596800
    );
    expect(new Timestamp(253402300799, 0)).to.have.property(
      'seconds',
      253402300799
    );

    expect(() => {
      new Timestamp(-62135596801, 0);
    })
      .to.throw(/seconds/)
      .with.property('code', Code.INVALID_ARGUMENT);

    expect(() => {
      new Timestamp(253402300800, 0);
    })
      .to.throw(/seconds/)
      .with.property('code', Code.INVALID_ARGUMENT);
  });

  it('constructor should validate the "nanoseconds" argument and store it', () => {
    expect(new Timestamp(0, 1)).to.have.property('nanoseconds', 1);
    expect(new Timestamp(0, 0)).to.have.property('nanoseconds', 0);
    expect(new Timestamp(0, 1e9 - 1)).to.have.property('nanoseconds', 1e9 - 1);

    expect(() => {
      new Timestamp(0, -1);
    })
      .to.throw(/nanoseconds/)
      .with.property('code', Code.INVALID_ARGUMENT);

    expect(() => {
      new Timestamp(0, 1e9);
    })
      .to.throw(/nanoseconds/)
      .with.property('code', Code.INVALID_ARGUMENT);
  });

  it('fromDate', () => {
    expect(Timestamp.fromDate(new Date(1488872578916))).to.deep.equal({
      seconds: 1488872578,
      nanoseconds: 916000000
    });

    expect(Timestamp.fromDate(new Date(-1250))).to.deep.equal({
      seconds: -2,
      nanoseconds: 750000000
    });
  });

  it('valueOf', () => {
    expect(new Timestamp(-62135596677, 456).valueOf()).to.equal(
      '000000000123.000000456'
    );
    expect(new Timestamp(-62135596800, 0).valueOf()).to.equal(
      '000000000000.000000000'
    );
    expect(new Timestamp(253402300799, 1e9 - 1).valueOf()).to.equal(
      '315537897599.999999999'
    );
  });

  it('arithmetic comparison of a Timestamp object to itself', () => {
    const timestamp = new Timestamp(1, 1);
    expect(timestamp < timestamp).to.be.false;
    expect(timestamp <= timestamp).to.be.true;
    expect(timestamp > timestamp).to.be.false;
    expect(timestamp >= timestamp).to.be.true;
  });

  it('arithmetic comparison of equivalent, but distinct, Timestamp objects', () => {
    const t1 = new Timestamp(1, 1);
    const t2 = new Timestamp(1, 1);
    expect(t1 < t2).to.be.false;
    expect(t1 <= t2).to.be.true;
    expect(t1 > t2).to.be.false;
    expect(t1 >= t2).to.be.true;
  });

  it('arithmetic comparison of Timestamp objects whose nanoseconds differ', () => {
    const t1 = new Timestamp(1, 1);
    const t2 = new Timestamp(1, 2);
    expect(t1 < t2).to.be.true;
    expect(t1 <= t2).to.be.true;
    expect(t1 > t2).to.be.false;
    expect(t1 >= t2).to.be.false;
  });

  it('arithmetic comparison of Timestamp objects whose seconds differ', () => {
    const t1 = new Timestamp(100, 0);
    const t2 = new Timestamp(200, 0);
    expect(t1 < t2).to.be.true;
    expect(t1 <= t2).to.be.true;
    expect(t1 > t2).to.be.false;
    expect(t1 >= t2).to.be.false;
  });

  it('arithmetic comparison of the smallest and largest Timestamp objects', () => {
    const t1 = new Timestamp(-62135596800, 0);
    const t2 = new Timestamp(253402300799, 999999999);
    expect(t1 < t2).to.be.true;
    expect(t1 <= t2).to.be.true;
    expect(t1 > t2).to.be.false;
    expect(t1 >= t2).to.be.false;
  });

  it('handles decimal inputs in fromMillis()', () => {
    const actual = Timestamp.fromMillis(1000.1);
    const expected = new Timestamp(1, 100000);
    expect(actual.isEqual(expected)).to.be.true;
  });

  it('serializes to JSON', () => {
    expect(new Timestamp(123, 456).toJSON()).to.deep.equal({
      seconds: 123,
      nanoseconds: 456
    });
    expect(new Timestamp(0, 0).toJSON()).to.deep.equal({
      seconds: 0,
      nanoseconds: 0
    });
    expect(new Timestamp(-123, 456).toJSON()).to.deep.equal({
      seconds: -123,
      nanoseconds: 456
    });
  });
});
