import { useState, useEffect } from 'react';
import { getProvinces, getWardsByProvince, type Province, type Ward } from '@/features/address/addressApi';

interface AddressFieldProps {
	provinceValue: string;
	wardValue: string;
	onProvinceChange: (code: string, name: string) => void;
	onWardChange: (code: string, name: string) => void;
	provinceError?: string;
	wardError?: string;
	disabled?: boolean;
	required?: boolean;
}

export function AddressField({
	provinceValue,
	wardValue,
	onProvinceChange,
	onWardChange,
	provinceError,
	wardError,
	disabled = false,
	required = false
}: AddressFieldProps) {
	const [provinces, setProvinces] = useState<Province[]>([]);
	const [wards, setWards] = useState<Ward[]>([]);
	const [loadingWards, setLoadingWards] = useState(false);

	// Load provinces on mount
	useEffect(() => {
		const loadProvinces = async () => {
			try {
				const data = await getProvinces();
				setProvinces(data);
			} catch (e) {
				console.error("Failed to load provinces:", e);
			}
		};
		loadProvinces();
	}, []);

	// Convert name to code if needed
	const getProvinceCode = (value: string): string => {
		if (!value) return '';
		// If value is numeric (code), return as-is
		if (/^\d+$/.test(value)) return value;
		// If value is name, find code
		const province = provinces.find(p => p.name === value);
		return province ? String(province.code) : value;
	};

	const getWardCode = (value: string): string => {
		if (!value) return '';
		// If value is numeric (code), return as-is
		if (/^\d+$/.test(value)) return value;
		// If value is name, find code
		const ward = wards.find(w => w.name === value);
		return ward ? String(ward.code) : value;
	};

	// Load wards when province changes
	useEffect(() => {
		const loadWards = async () => {
			const provinceCode = getProvinceCode(provinceValue);
			if (!provinceCode) {
				setWards([]);
				return;
			}

			setLoadingWards(true);
			try {
				const wardsData = await getWardsByProvince(Number(provinceCode));
				setWards(wardsData);
			} catch (e) {
				console.error("Failed to load wards:", e);
				setWards([]);
			} finally {
				setLoadingWards(false);
			}
		};
		loadWards();
	}, [provinceValue, provinces]);

	const provinceCode = getProvinceCode(provinceValue);
	const wardCode = getWardCode(wardValue);

	const handleProvinceChange = (value: string) => {
		const province = provinces.find(p => p.code === Number(value));
		onProvinceChange(value, province?.name || '');
		// Reset ward when province changes
		if (wardValue) {
			onWardChange('', '');
		}
	};

	const handleWardChange = (value: string) => {
		const ward = wards.find(w => w.code === Number(value));
		onWardChange(value, ward?.name || '');
	};

	return (
		<>
			{/* Tỉnh/Thành phố */}
			<div className="flex flex-col gap-2">
				<label className="font-medium text-gray-700">
					Tỉnh/Thành phố {required && <span className="text-red-500">*</span>}
				</label>
				<select
					className={`border rounded px-3 py-2 bg-white ${provinceError ? 'border-red-500' : ''}`}
					required={required}
					value={provinceCode}
					onChange={(e) => handleProvinceChange(e.target.value)}
					disabled={disabled}
				>
					<option value="">-- Chọn tỉnh/thành phố --</option>
					{provinces.map((p) => (
						<option key={p.code} value={p.code}>
							{p.name}
						</option>
					))}
				</select>
				{provinceError && (
					<span className="text-red-500 text-xs mt-1">{provinceError}</span>
				)}
			</div>

			{/* Phường/Xã */}
			<div className="flex flex-col gap-2">
				<label className="font-medium text-gray-700">
					Phường/Xã {required && <span className="text-red-500">*</span>}
				</label>
				<select
					className={`border rounded px-3 py-2 bg-white ${wardError ? 'border-red-500' : ''}`}
					required={required}
					value={wardCode}
					onChange={(e) => handleWardChange(e.target.value)}
					disabled={disabled || !provinceCode || loadingWards}
				>
					<option value="">
						{loadingWards ? '-- Đang tải... --' : '-- Chọn phường/xã --'}
					</option>
					{wards.map((w) => (
						<option key={w.code} value={w.code}>
							{w.name}
						</option>
					))}
				</select>
				{wardError && (
					<span className="text-red-500 text-xs mt-1">{wardError}</span>
				)}
			</div>
		</>
	);
}
