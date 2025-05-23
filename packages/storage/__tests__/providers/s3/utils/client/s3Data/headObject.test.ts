import { HttpResponse } from '@aws-amplify/core/internals/aws-client-utils';

import { s3TransferHandler } from '../../../../../../src/providers/s3/utils/client/runtime/s3TransferHandler/fetch';
import { headObject } from '../../../../../../src/providers/s3/utils/client/s3data';
import { validateObjectUrl } from '../../../../../../src/providers/s3/utils/validateObjectUrl';
import {
	DEFAULT_RESPONSE_HEADERS,
	defaultConfig,
	expectedMetadata,
} from '../S3/cases/shared';
import { IntegrityError } from '../../../../../../src/errors/IntegrityError';

jest.mock('../../../../../../src/providers/s3/utils/validateObjectUrl');
jest.mock(
	'../../../../../../src/providers/s3/utils/client/runtime/s3TransferHandler/fetch',
);

const mockS3TransferHandler = s3TransferHandler as jest.Mock;
const mockBinaryResponse = ({
	status,
	headers,
	body,
}: {
	status: number;
	headers: Record<string, string>;
	body: string;
}): HttpResponse => {
	const responseBody = {
		json: async (): Promise<any> => {
			throw new Error(
				'Parsing response to JSON is not implemented. Please use response.text() instead.',
			);
		},
		blob: async () => new Blob([body], { type: 'plain/text' }),
		text: async () => body,
	} as HttpResponse['body'];

	return {
		statusCode: status,
		headers,
		body: responseBody,
	} as any;
};

const headObjectSuccessResponse = {
	status: 200,
	headers: {
		...DEFAULT_RESPONSE_HEADERS,
		'x-amz-version-id': 'versionId',
		etag: 'etag',
	},
	body: '',
};

describe('serializeHeadObjectRequest', () => {
	const mockIsValidObjectUrl = jest.mocked(validateObjectUrl);
	beforeEach(() => {
		mockS3TransferHandler.mockReset();
	});

	it('should pass when objectUrl is durable', async () => {
		expect.assertions(1);
		mockS3TransferHandler.mockResolvedValue(
			mockBinaryResponse(headObjectSuccessResponse as any),
		);
		const output = await headObject(defaultConfig, {
			Bucket: 'bucket',
			Key: 'key',
		});
		expect(output).toEqual({
			$metadata: expect.objectContaining(expectedMetadata),
			VersionId: 'versionId',
			ETag: 'etag',
		});
	});

	it('should fail when objectUrl is NOT durable', async () => {
		expect.assertions(1);
		mockS3TransferHandler.mockResolvedValue(
			mockBinaryResponse(headObjectSuccessResponse as any),
		);
		const integrityError = new IntegrityError();
		mockIsValidObjectUrl.mockImplementationOnce(() => {
			throw integrityError;
		});
		expect(
			headObject(defaultConfig, {
				Bucket: 'bucket',
				Key: 'key',
			}),
		).rejects.toThrow(integrityError);
	});
});
