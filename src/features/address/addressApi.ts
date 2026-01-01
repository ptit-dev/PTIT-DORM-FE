import provincesData from "@//assets/provinces.json";
import wardsData from "@//assets/wards.json";

export interface Province {
	code: number;
	codename: string;
	division_type: string;
	name: string;
	phone_code: number;
}

export interface Ward {
	code: number;
	codename: string;
	division_type: string;
	name: string;
	province_code: number;
}

export async function getProvinces(): Promise<Province[]> {
	return Promise.resolve(provincesData as Province[]);
}

export async function getProvince(provinceCode: number): Promise<Province> {
	const province = provincesData.find((p: any) => p.code === provinceCode);
	if (!province) {
		throw new Error("Không tìm thấy tỉnh/thành phố");
	}
	return Promise.resolve(province as Province);
}

export async function getWardsByProvince(provinceCode: number): Promise<Ward[]> {
	const wards = wardsData.filter((w: any) => w.province_code === provinceCode);
	return Promise.resolve(wards as Ward[]);
}

export async function getWard(wardCode: number): Promise<Ward> {
	const ward = wardsData.find((w: any) => w.code === wardCode);
	if (!ward) {
		throw new Error("Không tìm thấy phường/xã");
	}
	return Promise.resolve(ward as Ward);
}

export async function searchProvinces(query: string): Promise<Province[]> {
	const lowerQuery = query.toLowerCase();
	const results = provincesData.filter((p: any) => 
		p.name.toLowerCase().includes(lowerQuery) || 
		p.codename.toLowerCase().includes(lowerQuery)
	);
	return Promise.resolve(results as Province[]);
}

export async function searchWards(query: string, provinceCode?: number): Promise<Ward[]> {
	const lowerQuery = query.toLowerCase();
	let results = wardsData.filter((w: any) => 
		w.name.toLowerCase().includes(lowerQuery) || 
		w.codename.toLowerCase().includes(lowerQuery)
	);
	
	if (provinceCode) {
		results = results.filter((w: any) => w.province_code === provinceCode);
	}
	
	return Promise.resolve(results as Ward[]);
}
