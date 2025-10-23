import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { IProduct } from '../../../utils/types';
import { IBasket } from './../../../utils/types/index';

const initialState: IBasket = {
	items: [],
	totalCount: 0,
};

export const basketSlice = createSlice({
	name: 'basket',
	initialState,
	reducers: {
		addProductCart: (state, { payload }: PayloadAction<IProduct>) => {
			const itemInCart = state.items.find(item => item._id === payload._id); //undefined or product
			if (itemInCart) {
				return state
			} else {
				state.items.push(payload);
				state.totalCount++;
			}
		},
		removeProductCart: (state, action: PayloadAction<string>) => {
			const itemExists = state.items.find(item => item._id === action.payload);
			if (itemExists) {
				state.items = state.items.filter(item => {
					return item._id !== action.payload;
				});
				state.totalCount--;
			}
		},
		resetBasket: () => initialState,
		clearBasket: (state) => {
			state.items = [];
			state.totalCount = 0;
		},
	},
	selectors: {
		selectBasketItems: (state:IBasket) => state.items,
		selectBasketTotalCount: (state: IBasket) => state.totalCount,
	},
	
});
