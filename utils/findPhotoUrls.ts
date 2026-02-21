import { PhotoItem } from "@/redux/stateServiceTypes";

export const findPhotoForPlantDetail = (productId: string, sizeId: string, arr: PhotoItem[] | null) => {
  console.log("findPhotoForPlantDetail", productId, sizeId, 'arr', arr);
  if (!arr) return null;
  const photoExists = arr.filter(photo => 
      photo.appProperties.productId === productId && photo.appProperties.sizeId === sizeId
    )
    return photoExists
  }