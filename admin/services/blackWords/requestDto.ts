import { BlackWordType } from '../../../common/Define';

export interface createBlackWordDto {
  type: BlackWordType;
  name: string;
  description: string;
}

export interface blackWordParamDto {
  id: number;
}
