<?php
/*
 *
 * Copyright 2015 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
nds PHPUnit_Framework_TestCase
{
    public function setUp()
    {
    }

    public function tearDown()
    {
    }

    public function testCreateSslWith3Null()
    {
        $channel_credentials = Grpc\ChannelCredentials::createSsl(null, null,
                                                                  null);
        $this->assertNotNull($channel_credentials);
    }

    public function testCreateSslWith3NullString()
    {
        $channel_credentials = Grpc\ChannelCredentials::createSsl('', '', '');
        $this->assertNotNull($channel_credentials);
    }

    public function testCreateInsecure()
    {
        $channel_credentials = Grpc\ChannelCredentials::createInsecure();
        $this->assertNull($channel_credentials);
    }

    public function testDefaultRootsPem()
    {
        Grpc\ChannelCredentials::setDefaultRootsPem("Pem-Content-Not-Verified");
        $this->assertTrue(Grpc\ChannelCredentials::isDefaultRootsPemSet());
        Grpc\ChannelCredentials::invalidateDefaultRootsPem();
        $this->assertFalse(Grpc\ChannelCredentials::isDefaultRootsPemSet());
        Grpc\ChannelCredentials::setDefaultRootsPem("Content-Not-Verified");
        $this->assertTrue(Grpc\ChannelCredentials::isDefaultRootsPemSet());
    }

    /**
     * @expectedException InvalidArgumentException
     */
    public function testInvalidCreateSsl()
    {
        $channel_credentials = Grpc\ChannelCredentials::createSsl([]);
    }

    /**
     * @expectedException InvalidArgumentException
     */
    public function testInvalidCreateComposite()
    {
        $channel_credentials = Grpc\ChannelCredentials::createComposite(
            'something', 'something');
    }
}
