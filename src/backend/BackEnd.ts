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



