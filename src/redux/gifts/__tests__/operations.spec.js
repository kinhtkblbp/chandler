import {getGiftsByContact} from '../operations';
import {
  getGiftsByContactFailed,
  getGiftsByContactFetched,
  getGiftsByContactSuccess,
} from '../actions';
import {API} from 'api';

jest.mock('api', () => ({
  API: {
    Gifts: {
      getAllByContact: jest.fn(),
    },
  },
}));

describe('Redux', () => {
  describe('GIFTS', () => {
    describe('Operations', () => {
      let dispatch;
      const contactId = 5;

      beforeEach(() => {
        dispatch = jest.fn();
        API.Gifts.getAllByContact.mockReset();
      });

      describe('getGiftsByContact', () => {
        it('should not do anything if it is already fetching', async () => {
          const getState = () => ({
            getGiftsByContact: {
              isFetching: true,
            },
          });
          await getGiftsByContact(contactId)(dispatch, getState);
          expect(dispatch.mock.calls.length).toBe(0);
        });

        it('should not do anything if every element has already been fetched', async () => {
          const getState = () => ({
            contacts: {
              [contactId]: {
                statistics: {
                  number_of_gifts: 5,
                },
                gifts: [1, 2, 3, 4, 5],
              },
            },
            getGiftsByContact: {
              isFetching: false,
            },
          });
          await getGiftsByContact(contactId)(dispatch, getState);
          expect(dispatch.mock.calls.length).toBe(0);
          expect(API.Gifts.getAllByContact.mock.calls.length).toBe(0);
        });

        it('should trigger fetch action (success)', async () => {
          const res = {
            data: ['a'],
          };
          const fetchedPageCount = 3;
          const getState = () => ({
            contacts: {
              [contactId]: {},
            },
            getGiftsByContact: {
              isFetching: false,
              fetchedPageCount,
            },
          });
          API.Gifts.getAllByContact.mockReturnValue(Promise.resolve(res));
          await getGiftsByContact(contactId)(dispatch, getState);
          expect(dispatch.mock.calls.length).toBe(2);
          expect(dispatch.mock.calls[0]).toEqual([
            getGiftsByContactFetched(contactId),
          ]);
          expect(dispatch.mock.calls[1]).toEqual([
            getGiftsByContactSuccess(contactId, res.data),
          ]);
          expect(API.Gifts.getAllByContact.mock.calls.length).toBe(1);
          expect(API.Gifts.getAllByContact.mock.calls[0]).toEqual([
            contactId,
            fetchedPageCount + 1,
          ]);
        });

        it('should trigger fetch action (failed)', async () => {
          const error = new Error();
          const fetchedPageCount = 0;
          const getState = () => ({
            contacts: {
              [contactId]: {},
            },
            getGiftsByContact: {
              isFetching: false,
              fetchedPageCount,
            },
          });
          API.Gifts.getAllByContact.mockReturnValue(Promise.reject(error));
          await getGiftsByContact(contactId)(dispatch, getState);
          expect(dispatch.mock.calls.length).toBe(2);
          expect(dispatch.mock.calls[0]).toEqual([
            getGiftsByContactFetched(contactId),
          ]);
          expect(dispatch.mock.calls[1]).toEqual([
            getGiftsByContactFailed(error),
          ]);
          expect(API.Gifts.getAllByContact.mock.calls.length).toBe(1);
          expect(API.Gifts.getAllByContact.mock.calls[0]).toEqual([
            contactId,
            fetchedPageCount + 1,
          ]);
        });
      });
    });
  });
});
