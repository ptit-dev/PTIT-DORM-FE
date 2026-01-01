export function validateEmployeeField(name: string, value: string): string {
	switch (name) {
		case 'fullname':
			if (!value.trim()) return 'Họ tên bắt buộc';
			if (value.trim().length < 3) return 'Họ tên phải có ít nhất 3 ký tự';
			return '';
		case 'phone':
			if (!value.trim()) return 'Số điện thoại bắt buộc';
			if (!/^\d{10}$/.test(value)) return 'Số điện thoại 10 chữ số';
			if (!/^0/.test(value)) return 'Số điện thoại không hợp lệ';
			return '';
		case 'cccd':
			if (!value.trim()) return 'CCCD bắt buộc';
			if (!/^\d{12}$/.test(value)) return 'CCCD 12 chữ số';
			return '';
		case 'dob':
			if (!value) return 'Ngày sinh bắt buộc';
			const birthDate = new Date(value);
			const today = new Date();
			if (birthDate >= today) return 'Ngày sinh không hợp lệ';
			const age = today.getFullYear() - birthDate.getFullYear();
			if (age < 18) return 'Nhân viên phải từ 18 tuổi trở lên';
			if (age > 70) return 'Tuổi không hợp lệ';
			return '';
		case 'province':
			if (!value.trim()) return 'Tỉnh/TP bắt buộc';
			if (/^\d+$/.test(value)) return 'Tỉnh/TP không hợp lệ';
			return '';
		case 'commune':
			if (!value.trim()) return 'Xã/Phường bắt buộc';
			if (/^\d+$/.test(value)) return 'Xã/Phường không hợp lệ';
			return '';
		case 'detail_address':
			if (!value.trim()) return 'Địa chỉ chi tiết bắt buộc';
			if (/^\d+$/.test(value)) return 'Địa chỉ chi tiết không hợp lệ';
			return '';
		case 'email':
			if (!value.trim()) return 'Email bắt buộc';
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email không hợp lệ';
			return '';
		case 'username':
			if (!value.trim()) return 'Tên đăng nhập bắt buộc';
			if (value.length < 5) return 'Tên đăng nhập phải có ít nhất 5 ký tự';
			if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới';
			return '';
		default:
			return '';
	}
}
