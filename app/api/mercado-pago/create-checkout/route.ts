import { NextResponse, type NextRequest } from "next/server";
import { Preference } from "mercadopago";
import { mpClient } from "@/app/lib/mercado-pago";

export async function POST(req: NextRequest) {
	const { testeId, userEmail } = await req.json();

	try {
		const preference = new Preference(mpClient);

		const createdPreference = await preference.create({
			body: {
				external_reference: testeId, // mercado pago score
				metadata: {
					testeId, // teste_id
					userEmail,
				},
				...(userEmail && { payer: { email: userEmail } }), // impact on the score
				items: [
					{
						id: "",
						description: "",
						title: "",
						quantity: 1,
						unit_price: 1,
						currency_id: "BRL",
						category_id: "services",
					},
				],
				payment_methods: {
					installments: 12,
					// excluded_payment_methods: [
					//   { id: 'bolbradesco' },
					//   { id: 'pec' }
					// ],
					// excluded_payment_types: [
					//   { id: 'debit_card' },
					//   { id: 'credit_card' }
					// ]
				},
				auto_return: "approved",
				back_urls: {
					success: `${req.headers.get("origin")}/api/mercado-pago/pending`,
					failure: `${req.headers.get("origin")}/api/mercado-pago/pending`,
					pending: `${req.headers.get("origin")}/api/mercado-pago/pending`,
				},
			},
		});

		if (!createdPreference.id) {
			return NextResponse.json(
				{ error: "Error creating Mercado Pago checkout" },
				{ status: 500 },
			);
		}

		return NextResponse.json(
			{
				preferenceId: createdPreference.id,
				initPoint: createdPreference.init_point,
			},
			{ status: 200 },
		);
	} catch (e) {
		console.error(e);
		return NextResponse.json(
			{ error: "Error creating Mercado Pago checkout" },
			{ status: 500 },
		);
	}
}