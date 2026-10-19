export const validateCoupon = catchAsync(async (req, res, next) => {
  const { code } = req.body;

  const coupon = await Coupon.findOne({ code });

  if (!coupon) {
    return next(new AppError('Invalid coupon', 400));
  }

  const now = new Date();

  if (now < coupon.startsAt) {
    return next(new AppError('Coupon is not active yet', 400));
  }

  if (now > coupon.expiresAt) {
    return next(new AppError('Coupon has expired', 400));
  }

  res.status(200).json({
    status: 'success',
    data: {
      coupon,
    },
  });
});

