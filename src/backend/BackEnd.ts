//同じ動きをする関数をここでまとめる
import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import { InventorySearch, ImageUrlSet } from './Server_end';



export const handleChange = (
  index: number,
  field: any,
  event: any,
  formData: any
) => {
  const newFormData = [...formData];
  newFormData[index][field] = event.target.value;
  return newFormData;
}

  const nextDatail = async (
    searchDataIndex: number,
    destination: number,
    searchtabledata: any,
    setDetailisDialogOpen: (dialog: boolean) => void,
    setisLoading: (loading: boolean) => void,
    setDetailIMAGE: (imageresult: string) => void,
    setsearchData: (data: any) => void,
    setsearchDataIndex: (num: number) => void,
  ) => {
    const updateindex = searchDataIndex + destination
    setDetailisDialogOpen(false);
    setsearchDataIndex(updateindex);
    setisLoading(true);
    var match = 'https://lh3.googleusercontent.com/d/1RNZ4G8tfPg7dyKvGABKBM88-tKIEFhbm';
    const image = await InventorySearch(searchtabledata[updateindex][1],"商品コード","商品画像");
    if (image[2] !== ''){
      match = ImageUrlSet(image[2]);
    }
    await setDetailIMAGE(match);
    await setsearchData(searchtabledata[updateindex]);
    await setDetailisDialogOpen(true);
    setisLoading(false);
    console.log(searchtabledata[updateindex])
  };

