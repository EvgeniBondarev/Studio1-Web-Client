import {useEffect, useRef, useState} from 'react'
import {useMutation, useQueryClient} from '@tanstack/react-query'
import {message, Modal} from 'antd'
import type {EtPart, EtProducer} from '../../api/types.ts'
import {createPart, deletePart, updatePart} from '../../api/parts.ts'

export const usePartFormModal = (
    producer?: EtProducer | null,
    autoEditPart?: EtPart | null,
    onAutoEditProcessed?: () => void,
    selectedPart?: EtPart | null,
    onSelectPart?: (part: EtPart | null) => void
) => {
    const [isModalOpen, setModalOpen] = useState(false)
    const [editingPart, setEditingPart] = useState<EtPart | null>(null)
    const queryClient = useQueryClient()

    // Автоматическое открытие редактирования при получении autoEditPart
    const processedAutoEditPartRef = useRef<EtPart | null | undefined>(undefined)
    useEffect(() => {
        if (autoEditPart && producer && processedAutoEditPartRef.current !== autoEditPart) {
            setEditingPart(autoEditPart)
            setModalOpen(true)
            processedAutoEditPartRef.current = autoEditPart
            onAutoEditProcessed?.()
        } else if (!autoEditPart) {
            processedAutoEditPartRef.current = undefined
        }
    }, [autoEditPart, producer, onAutoEditProcessed])

    const createMutation = useMutation({
        mutationFn: createPart,
        onSuccess: () => {
            message.success('Деталь добавлена')
            queryClient.invalidateQueries({queryKey: ['parts']})
            closeModal()
        },
    })

    const updateMutation = useMutation({
        mutationFn: ({id, payload}: { id: number; payload: Partial<EtPart> }) => updatePart(id, payload),
        onSuccess: () => {
            message.success('Деталь сохранена')
            queryClient.invalidateQueries({queryKey: ['parts']})
            closeModal()
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deletePart(id),
        onSuccess: (_, id) => {
            message.success('Деталь удалена')
            queryClient.invalidateQueries({queryKey: ['parts']})
            if (selectedPart?.Id === id) {
                onSelectPart?.(null)
            }
        },
    })

    const confirmDelete = (part: EtPart) => {
        Modal.confirm({
            title: 'Удалить деталь?',
            content: `Вы уверены, что хотите удалить деталь ${part.Code ?? 'без кода'}?`,
            okText: 'Удалить',
            cancelText: 'Отмена',
            okButtonProps: {danger: true, loading: deleteMutation.isPending},
            onOk: () => deleteMutation.mutate(part.Id),
        })
    }

    const handleSubmit = (values: Partial<EtPart>) => {
        if (!producer) return

        const payload = {...values, ProducerId: producer.Id}
        if (editingPart) {
            updateMutation.mutate({id: editingPart.Id, payload})
        } else {
            createMutation.mutate(payload)
        }
    }

    const openModal = (part?: EtPart) => {
        setEditingPart(part || null)
        setModalOpen(true)
    }

    const closeModal = () => {
        setModalOpen(false)
        setEditingPart(null)
    }

    return {
        isModalOpen,
        editingPart,
        openModal,
        closeModal,
        handleSubmit,
        confirmDelete,
        isSubmitting: createMutation.isPending || updateMutation.isPending,
        modalMode: editingPart ? 'edit' as const : 'create' as const,
    }
}