// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { copyObject } from '../../../../../../../src/providers/s3/utils/client/s3data';
import { ApiFunctionalTestCase } from '../../testUtils/types';

import {
	DEFAULT_RESPONSE_HEADERS,
	defaultConfig,
	expectedMetadata,
} from './shared';

// API Reference: https://docs.aws.amazon.com/AmazonS3/latest/API/API_CopyObject.html
const copyObjectHappyCase: ApiFunctionalTestCase<typeof copyObject> = [
	'happy case',
	'copyObject',
	copyObject,
	defaultConfig,
	{
		Bucket: 'bucket',
		CopySource: 'sourceBucket/sourceKey',
		Key: 'key',
		CacheControl: 'cacheControl',
		ContentType: 'contentType',
		ACL: 'acl',
		CopySourceIfMatch: 'eTag',
		CopySourceIfUnmodifiedSince: new Date(0),
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://bucket.s3.us-east-1.amazonaws.com/key?x-id=CopyObject',
		}),
		method: 'PUT',
		headers: expect.objectContaining({
			'x-amz-copy-source': 'sourceBucket/sourceKey',
			'cache-control': 'cacheControl',
			'content-type': 'contentType',
			'x-amz-acl': 'acl',
			'x-amz-copy-source-if-match': 'eTag',
			'x-amz-copy-source-if-unmodified-since': 'Thu, 01 Jan 1970 00:00:00 GMT',
		}),
	}),
	{
		status: 200,
		headers: DEFAULT_RESPONSE_HEADERS,
		body:
			'<CopyObjectResult>' +
			'<ETag>string</ETag>' +
			'<LastModified>timestamp</LastModified>' +
			'<ChecksumCRC32>string</ChecksumCRC32>' +
			'<ChecksumCRC32C>string</ChecksumCRC32C>' +
			'<ChecksumSHA1>string</ChecksumSHA1>' +
			'<ChecksumSHA256>string</ChecksumSHA256>' +
			'</CopyObjectResult>',
	},
	{
		$metadata: expect.objectContaining(expectedMetadata),
	},
];

const copyObjectHappyCaseCustomEndpoint: ApiFunctionalTestCase<
	typeof copyObject
> = [
	'happy case',
	'getObject with custom endpoint',
	copyObject,
	{
		...defaultConfig,
		customEndpoint: 'custom.endpoint.com',
		forcePathStyle: true,
	},
	{
		Bucket: 'bucket',
		Key: 'key',
		CopySource: 'sourceBucket/sourceKey',
	},
	expect.objectContaining({
		url: expect.objectContaining({
			href: 'https://custom.endpoint.com/bucket/key?x-id=CopyObject',
		}),
	}),
	{
		status: 200,
		headers: DEFAULT_RESPONSE_HEADERS,
		body: '',
	},
	expect.objectContaining({
		/**	skip validating response */
	}) as any,
];
export default [copyObjectHappyCase, copyObjectHappyCaseCustomEndpoint];
