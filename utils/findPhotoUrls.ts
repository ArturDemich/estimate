import { PhotoItem } from "@/redux/stateServiceTypes";

export const findPhotoForPlantDetail = (productId: string, sizeId: string, arr: PhotoItem[] | null) => {
  if (!arr) return null;
    return arr.filter(photo => 
      photo.appProperties.productId === productId && photo.appProperties.sizeId === sizeId
    ).map(p => p.url);
  }