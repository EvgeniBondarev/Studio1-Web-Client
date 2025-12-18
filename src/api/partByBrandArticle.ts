import {odataClient} from './odataClient.ts'
import type {PRResponse} from './types.ts';


export const fetchProductByBrandAndArticle = async (
    brand: string,
    article: string,
): Promise<PRResponse> => {
    const response = await odataClient.list<PRResponse>('ProductsMnk', {
        filter: `Brand eq '${brand}' and Article eq '${article}'`,
        expand: `
      VehicleAccords($expand=Vehicle),
      VendorCategories($expand=VendorCategory),
      Attributes($expand=Attribute),
      OemAccords($expand=Oem),
      Images
    `,
    })

    return response.value[0]
}
