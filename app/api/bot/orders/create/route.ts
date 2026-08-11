import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ==================================================
// SUPABASE
// ==================================================

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ==================================================
// SETTINGS
// ==================================================

const FLOOR_AMOUNT = 1;

// راكب = 15% إجمالي
// منها:
// 13% للمنتج
// 2% للإدارة
const PASSENGER_COMMISSION = 15;

// أوردر = 20% إجمالي
// منها:
// 18% للمنتج
// 2% للإدارة
const ORDER_COMMISSION = 20;

const ADMIN_COMMISSION = 2;

// ==================================================
// HELPERS
// ==================================================

function normalizeJordanPhone(
  phone: unknown
) {
  if (!phone) {
    return null;
  }

  let value = String(phone)
    .trim()
    .replace(/\D/g, "");

  // 9627xxxxxxxx
  if (value.startsWith("9627")) {
    value =
      "0" +
      value.slice(3);
  }

  // 009627xxxxxxxx
  if (value.startsWith("009627")) {
    value =
      "0" +
      value.slice(6);
  }

  // 7xxxxxxxx
  if (
    value.startsWith("7") &&
    value.length === 9
  ) {
    value =
      "0" +
      value;
  }

  // 07xxxxxxxx
  if (
    value.startsWith("07") &&
    value.length === 10
  ) {
    return value;
  }

  return null;
}

// ==================================================
// JORDAN WEEK
// ==================================================

function getJordanWeek() {
  const now =
    new Date();

  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          "Asia/Amman",

        year:
          "numeric",

        month:
          "2-digit",

        day:
          "2-digit",

        weekday:
          "short",
      }
    ).formatToParts(
      now
    );

  const get = (
    type: string
  ) =>
    parts.find(
      (part) =>
        part.type === type
    )?.value ?? "";

  const year =
    Number(
      get("year")
    );

  const month =
    Number(
      get("month")
    );

  const day =
    Number(
      get("day")
    );

  const weekday =
    get("weekday");

  const weekdayNumber: Record<
    string,
    number
  > = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const current =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day
      )
    );

  current.setUTCDate(
    current.getUTCDate() -
      (
        weekdayNumber[
          weekday
        ] ?? 0
      )
  );

  const weekStartText =
    current
      .toISOString()
      .split("T")[0];

  current.setUTCDate(
    current.getUTCDate() +
      6
  );

  const weekEndText =
    current
      .toISOString()
      .split("T")[0];

  return {
    weekStartText,
    weekEndText,
  };
}

// ==================================================
// BOT AUTH
// ==================================================

function checkBotKey(
  req: NextRequest
) {
  const expectedKey =
    process.env.WHATSAPP_BOT_KEY;

  const receivedKey =
    req.headers.get(
      "x-bot-key"
    );

  if (
    !expectedKey
  ) {
    return false;
  }

  if (
    !receivedKey
  ) {
    return false;
  }

  return (
    receivedKey ===
    expectedKey
  );
}

// ==================================================
// POST
// ==================================================

export async function POST(
  req: NextRequest
) {
  let createdOrderId:
    | number
    | null = null;

  let insertedTransactionIds:
    | number[]
    = [];

  let captainWalletChanged =
    false;

  let producerWalletChanged =
    false;

  let captainIdForRollback:
    | number
    | null = null;

  let producerIdForRollback:
    | number
    | null = null;

  let captainDeductionForRollback =
    0;

  let producerCreditForRollback =
    0;

  try {
    // ==================================================
    // SECURITY
    // ==================================================

    if (
      !checkBotKey(req)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "غير مصرح",
        },
        {
          status: 401,
        }
      );
    }

    // ==================================================
    // BODY
    // ==================================================

    const body =
      await req.json();

    const producerPhone =
      normalizeJordanPhone(
        body?.producerPhone
      );

    const captainPhone =
      normalizeJordanPhone(
        body?.captainPhone
      );

    const orderType =
      String(
        body?.orderType ??
          "راكب"
      ).trim();

    const amount =
      Number(
        body?.amount
      );

    // ==================================================
    // VALIDATION
    // ==================================================

    if (
      !producerPhone
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "رقم المنتج غير صحيح",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !captainPhone
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "رقم الكابتن غير صحيح",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isFinite(
        amount
      ) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "قيمة الطلب غير صحيحة",
        },
        {
          status: 400,
        }
      );
    }

    if (
      orderType !==
        "راكب" &&
      orderType !==
        "اوردر"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "نوع الطلب غير صحيح",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // WEEK
    // ==================================================

    const {
      weekStartText,
      weekEndText,
    } =
      getJordanWeek();

    // ==================================================
    // FIND PRODUCER
    // ==================================================

    const {
      data: producer,
      error:
        producerError,
    } =
      await supabase
        .from("Users")
        .select(
          `
          id,
          full_name,
          phone,
          is_producer,
          status,
          wallet_balance
          `
        )
        .eq(
          "phone",
          producerPhone
        )
        .maybeSingle();

    if (
      producerError
    ) {
      console.error(
        "PRODUCER ERROR:",
        producerError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            producerError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (
      !producer
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "المنتج غير موجود في النظام",
        },
        {
          status: 404,
        }
      );
    }

    if (
      !producer.is_producer
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "صاحب الطلب ليس منتجًا",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // FIND CAPTAIN
    // ==================================================

    const {
      data: captain,
      error:
        captainError,
    } =
      await supabase
        .from("Users")
        .select(
          `
          id,
          full_name,
          phone,
          is_captain,
          status,
          wallet_balance
          `
        )
        .eq(
          "phone",
          captainPhone
        )
        .maybeSingle();

    if (
      captainError
    ) {
      console.error(
        "CAPTAIN ERROR:",
        captainError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            captainError.message,
        },
        {
          status: 500,
        }
      );
    }

    if (
      !captain
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "الكابتن غير موجود في النظام",
        },
        {
          status: 404,
        }
      );
    }

    if (
      !captain.is_captain
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "الحساب ليس كابتنًا",
        },
        {
          status: 400,
        }
      );
    }

    // ==================================================
    // CAPTAIN STATUS
    // ==================================================

    const captainIsActive =
      captain.status ===
        true ||
      captain.status ===
        "true" ||
      captain.status ===
        1 ||
      captain.status ===
        "1";

    // ==================================================
    // COMMISSIONS
    // ==================================================

    const totalCommissionPercent =
      orderType ===
      "راكب"
        ? PASSENGER_COMMISSION
        : ORDER_COMMISSION;

    const totalCommission =
      Number(
        (
          amount *
          totalCommissionPercent /
          100
        ).toFixed(2)
      );

    const adminCommission =
      Number(
        (
          amount *
          ADMIN_COMMISSION /
          100
        ).toFixed(2)
      );

    const netProducerCommission =
      Number(
        (
          totalCommission -
          adminCommission
        ).toFixed(2)
      );

    // ==================================================
    // IMPORTANT
    // مثال راكب 5:
    //
    // إجمالي العمولة = 0.75
    // المنتج = 0.65
    // الإدارة = 0.10
    // الكابتن = يدفع 0.75
    // ==================================================

    const captainCommission =
      totalCommission;

    const producerCommission =
      netProducerCommission;

    const captainDue =
      totalCommission;

    // ==================================================
    // FLOOR
    // ==================================================

    let floorApplied =
      false;

    let existingFloorId:
      | number
      | null = null;

    if (
      captainIsActive
    ) {
      const {
        data:
          floorRows,
        error:
          floorError,
      } =
        await supabase
          .from(
            "BalanceTransactions"
          )
          .select(
            `
            id,
            wallet_deducted
            `
          )
          .eq(
            "user_id",
            captain.id
          )
          .eq(
            "description",
            "الأرضية الأسبوعية"
          )
          .eq(
            "week_start",
            weekStartText
          )
          .eq(
            "week_end",
            weekEndText
          )
          .eq(
            "is_settled",
            false
          )
          .order(
            "id",
            {
              ascending:
                true,
            }
          )
          .limit(1);

      if (
        floorError
      ) {
        return NextResponse.json(
          {
            success:
              false,
            error:
              floorError.message,
          },
          {
            status: 500,
          }
        );
      }

      if (
        floorRows &&
        floorRows.length >
          0
      ) {
        existingFloorId =
          Number(
            floorRows[0].id
          );

        floorApplied =
          floorRows[0]
            .wallet_deducted ===
          false;
      } else {
        floorApplied =
          true;
      }
    }

    // ==================================================
    // TOTAL CAPTAIN DEDUCTION
    // ==================================================

    const captainDeduction =
      Number(
        (
          captainCommission +
          (
            floorApplied
              ? FLOOR_AMOUNT
              : 0
          )
        ).toFixed(2)
      );

    captainIdForRollback =
      Number(
        captain.id
      );

    producerIdForRollback =
      Number(
        producer.id
      );

    captainDeductionForRollback =
      captainDeduction;

    producerCreditForRollback =
      producerCommission;

    const walletBefore =
      Number(
        captain.wallet_balance ??
          0
      );

    const producerWalletBefore =
      Number(
        producer.wallet_balance ??
          0
      );

    // ==================================================
    // CREATE ORDER
    // ==================================================

    const {
      data: order,
      error:
        orderError,
    } =
      await supabase
        .from("Orders")
        .insert({
          customer_name:
            producer.full_name ||
            producer.phone ||
            "منتج",

          customer_phone:
            producer.phone ||
            producerPhone,

          producer_id:
            producer.id,

          captain_id:
            captain.id,

          order_type:
            orderType,

          amount:
            amount,

          producer_commission:
            producerCommission,

          captain_commission:
            captainCommission,

          admin_commission:
            adminCommission,

          net_producer_commission:
            producerCommission,

          captain_due:
            captainDue,

          week_start:
            weekStartText,

          week_end:
            weekEndText,

          status:
            "completed",

          is_settled:
            false,
        })
        .select(
          `
          id,
          producer_id,
          captain_id,
          order_type,
          amount,
          producer_commission,
          captain_commission,
          admin_commission,
          net_producer_commission,
          captain_due,
          status
          `
        )
        .single();

    if (
      orderError ||
      !order
    ) {
      console.error(
        "CREATE ORDER ERROR:",
        orderError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            orderError?.message ??
            "تعذر إنشاء الطلب",
        },
        {
          status: 500,
        }
      );
    }

    createdOrderId =
      Number(
        order.id
      );

    // ==================================================
    // BALANCE TRANSACTIONS
    // ==================================================

    const transactions:
      any[] = [];

    // ==================================================
    // FLOOR TRANSACTION
    // ==================================================

    if (
      floorApplied &&
      existingFloorId ===
        null
    ) {
      transactions.push({
        user_id:
          captain.id,

        order_id:
          order.id,

        type:
          "debit",

        amount:
          FLOOR_AMOUNT,

        description:
          "الأرضية الأسبوعية",

        week_start:
          weekStartText,

        week_end:
          weekEndText,

        is_settled:
          false,

        wallet_deducted:
          false,
      });
    }

    // ==================================================
    // CAPTAIN COMMISSION
    // ==================================================

    transactions.push({
      user_id:
        captain.id,

      order_id:
        order.id,

      type:
        "debit",

      amount:
        captainCommission,

      description:
        `عمولة ${orderType} - المنتج: ${producer.full_name}`,

      week_start:
        weekStartText,

      week_end:
        weekEndText,

      is_settled:
        false,

      wallet_deducted:
        true,
    });

    // ==================================================
    // PRODUCER CREDIT
    // ==================================================

    transactions.push({
      user_id:
        producer.id,

      order_id:
        order.id,

      type:
        "credit",

      amount:
        producerCommission,

      description:
        `عمولة المنتج - ${orderType}`,

      week_start:
        weekStartText,

      week_end:
        weekEndText,

      is_settled:
        false,

      wallet_deducted:
        true,
    });

    // ==================================================
    // INSERT TRANSACTIONS
    // ==================================================

    const {
      data:
        insertedTransactions,
      error:
        transactionError,
    } =
      await supabase
        .from(
          "BalanceTransactions"
        )
        .insert(
          transactions
        )
        .select(
          "id"
        );

    if (
      transactionError ||
      !insertedTransactions
    ) {
      console.error(
        "TRANSACTION ERROR:",
        transactionError
      );

      await supabase
        .from("Orders")
        .delete()
        .eq(
          "id",
          order.id
        );

      return NextResponse.json(
        {
          success: false,
          error:
            transactionError?.message ??
            "تعذر حفظ الحركات المالية",
        },
        {
          status: 500,
        }
      );
    }

    insertedTransactionIds =
      insertedTransactions.map(
        (
          row
        ) =>
          Number(
            row.id
          )
      );

    // ==================================================
    // DEDUCT CAPTAIN WALLET
    // ==================================================

    const {
      data:
        newCaptainWallet,
      error:
        captainWalletError,
    } =
      await supabase.rpc(
        "deduct_wallet_balance",
        {
          p_user_id:
            captain.id,

          p_amount:
            captainDeduction,
        }
      );

    if (
      captainWalletError ||
      newCaptainWallet ===
        null ||
      newCaptainWallet ===
        undefined
    ) {
      console.error(
        "CAPTAIN WALLET ERROR:",
        captainWalletError
      );

      await supabase
        .from(
          "BalanceTransactions"
        )
        .delete()
        .in(
          "id",
          insertedTransactionIds
        );

      await supabase
        .from("Orders")
        .delete()
        .eq(
          "id",
          order.id
        );

      return NextResponse.json(
        {
          success: false,
          error:
            captainWalletError?.message ??
            "تعذر خصم العمولة من محفظة الكابتن",
        },
        {
          status: 500,
        }
      );
    }

    captainWalletChanged =
      true;

    const captainWalletAfter =
      Number(
        newCaptainWallet
      );

    // ==================================================
    // ADD PRODUCER WALLET
    // ==================================================

    const {
      data:
        newProducerWallet,
      error:
        producerWalletError,
    } =
      await supabase.rpc(
        "add_wallet_balance",
        {
          p_user_id:
            producer.id,

          p_amount:
            producerCommission,
        }
      );

    if (
      producerWalletError ||
      newProducerWallet ===
        null ||
      newProducerWallet ===
        undefined
    ) {
      console.error(
        "PRODUCER WALLET ERROR:",
        producerWalletError
      );

      // إعادة مبلغ الكابتن
      await supabase.rpc(
        "add_wallet_balance",
        {
          p_user_id:
            captain.id,

          p_amount:
            captainDeduction,
        }
      );

      captainWalletChanged =
        false;

      await supabase
        .from(
          "BalanceTransactions"
        )
        .delete()
        .in(
          "id",
          insertedTransactionIds
        );

      await supabase
        .from("Orders")
        .delete()
        .eq(
          "id",
          order.id
        );

      return NextResponse.json(
        {
          success: false,
          error:
            producerWalletError?.message ??
            "تعذر إضافة عمولة المنتج",
        },
        {
          status: 500,
        }
      );
    }

    producerWalletChanged =
      true;

    const producerWalletAfter =
      Number(
        newProducerWallet
      );

    // ==================================================
    // UPDATE FLOOR
    // ==================================================

    if (
      floorApplied &&
      existingFloorId !==
        null
    ) {
      const {
        error:
          floorUpdateError,
      } =
        await supabase
          .from(
            "BalanceTransactions"
          )
          .update({
            wallet_deducted:
              true,
          })
          .eq(
            "id",
            existingFloorId
          );

      if (
        floorUpdateError
      ) {
        console.error(
          "FLOOR UPDATE ERROR:",
          floorUpdateError
        );
      }
    }

    // ==================================================
    // NEW FLOOR TRANSACTION
    // ==================================================

    if (
      floorApplied &&
      existingFloorId ===
        null
    ) {
      const floorTransactionIndex =
        transactions.findIndex(
          (
            transaction
          ) =>
            transaction.description ===
            "الأرضية الأسبوعية"
        );

      if (
        floorTransactionIndex >=
          0
      ) {
        const floorTransaction =
          insertedTransactions[
            floorTransactionIndex
          ];

        if (
          floorTransaction
        ) {
          await supabase
            .from(
              "BalanceTransactions"
            )
            .update({
              wallet_deducted:
                true,
            })
            .eq(
              "id",
              floorTransaction.id
            );
        }
      }
    }

    // ==================================================
    // SUCCESS
    // ==================================================

    console.log(
      "\n================================="
    );

    console.log(
      "✅ BOT ORDER CREATED"
    );

    console.log(
      "ORDER ID:",
      order.id
    );

    console.log(
      "PRODUCER:",
      producer.full_name,
      producer.phone
    );

    console.log(
      "CAPTAIN:",
      captain.full_name,
      captain.phone
    );

    console.log(
      "TYPE:",
      orderType
    );

    console.log(
      "AMOUNT:",
      amount
    );

    console.log(
      "CAPTAIN COMMISSION:",
      captainCommission
    );

    console.log(
      "PRODUCER CREDIT:",
      producerCommission
    );

    console.log(
      "ADMIN COMMISSION:",
      adminCommission
    );

    console.log(
      "FLOOR:",
      floorApplied
    );

    console.log(
      "CAPTAIN TOTAL DEDUCTION:",
      captainDeduction
    );

    console.log(
      "=================================\n"
    );

    return NextResponse.json({
      success:
        true,

      order: {
        id:
          order.id,

        orderId:
          order.id,

        producerId:
          producer.id,

        captainId:
          captain.id,

        producerPhone:
          producer.phone,

        captainPhone:
          captain.phone,

        orderType:
          orderType,

        amount:
          amount,

        status:
          "completed",
      },

      commissions: {
        total:
          totalCommission,

        captain:
          captainCommission,

        producer:
          producerCommission,

        admin:
          adminCommission,
      },

      floorApplied:
        floorApplied,

      captainDeduction:
        captainDeduction,

      wallet: {
        captainBefore:
          walletBefore,

        captainAfter:
          captainWalletAfter,

        producerBefore:
          producerWalletBefore,

        producerAfter:
          producerWalletAfter,
      },

      weekStart:
        weekStartText,

      weekEnd:
        weekEndText,
    });

  } catch (
    error: any
  ) {
    console.error(
      "\n❌ CREATE BOT ORDER ERROR:"
    );

    console.error(
      error
    );

    // ==================================================
    // ROLLBACK PRODUCER
    // ==================================================

    if (
      producerWalletChanged &&
      producerIdForRollback !==
        null
    ) {
      try {
        await supabase.rpc(
          "deduct_wallet_balance",
          {
            p_user_id:
              producerIdForRollback,

            p_amount:
              producerCreditForRollback,
          }
        );
      } catch (
        rollbackError
      ) {
        console.error(
          "PRODUCER ROLLBACK ERROR:",
          rollbackError
        );
      }
    }

    // ==================================================
    // ROLLBACK CAPTAIN
    // ==================================================

    if (
      captainWalletChanged &&
      captainIdForRollback !==
        null
    ) {
      try {
        await supabase.rpc(
          "add_wallet_balance",
          {
            p_user_id:
              captainIdForRollback,

            p_amount:
              captainDeductionForRollback,
          }
        );
      } catch (
        rollbackError
      ) {
        console.error(
          "CAPTAIN ROLLBACK ERROR:",
          rollbackError
        );
      }
    }

    // ==================================================
    // DELETE TRANSACTIONS
    // ==================================================

    if (
      insertedTransactionIds.length >
      0
    ) {
      try {
        await supabase
          .from(
            "BalanceTransactions"
          )
          .delete()
          .in(
            "id",
            insertedTransactionIds
          );
      } catch (
        transactionRollbackError
      ) {
        console.error(
          "TRANSACTION ROLLBACK ERROR:",
          transactionRollbackError
        );
      }
    }

    // ==================================================
    // DELETE ORDER
    // ==================================================

    if (
      createdOrderId
    ) {
      try {
        await supabase
          .from("Orders")
          .delete()
          .eq(
            "id",
            createdOrderId
          );
      } catch (
        orderRollbackError
      ) {
        console.error(
          "ORDER ROLLBACK ERROR:",
          orderRollbackError
        );
      }
    }

    return NextResponse.json(
      {
        success: false,

        error:
          error?.message ??
          "حدث خطأ أثناء إنشاء الطلب",
      },
      {
        status: 500,
      }
    );
  }
}