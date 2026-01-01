interface Province {
	code: number;
	name: string;
}

interface Ward {
	code: number;
	name: string;
}

interface AddressSelectorProps {
	provinces: Province[];
	wards: Ward[];
	provinceValue: string;
	wardValue: string;
	onProvinceChange: (value: string) => void;
	onWardChange: (value: string) => void;
	provinceError?: string;
	wardError?: string;
	loadingWards?: boolean;
	disabled?: boolean;
	required?: boolean;
}

export function AddressSelector({
	provinces,
	wards,
	provinceValue,
	wardValue,
	onProvinceChange,
	onWardChange,
	provinceError,
	wardError,
	loadingWards = false,
	disabled = false,
	required = false
}: AddressSelectorProps) {
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
					value={provinceValue}
					onChange={(e) => onProvinceChange(e.target.value)}
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
					value={wardValue}
					onChange={(e) => onWardChange(e.target.value)}
					disabled={disabled || !provinceValue || loadingWards}
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
